<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import type { Map as LeafletMap, Marker, LayerGroup, TileLayer } from 'leaflet';
  import type { ProcessedMeeting, MarkerConfig, TilesConfig } from '@/types';
  import { selectMeeting } from '@stores/ui.svelte';
  import { getDirectionsUrl } from '@utils/format';
  import { DEFAULT_LOCATION_MARKER, buildMarkerIcon } from '@utils/markers';
  import { t } from '@stores/localization';

  interface Props {
    meetings: ProcessedMeeting[];
    locationMarker?: MarkerConfig;
    tiles?: TilesConfig;
    tilesDark?: TilesConfig;
    geoActive?: boolean;
    onsearcharea?: (lat: number, lng: number) => void;
  }

  const { meetings, locationMarker, tiles, tilesDark, geoActive = false, onsearcharea }: Props = $props();

  let mapEl: HTMLDivElement;
  let leafletMap: LeafletMap | null = null;
  let markersLayer: LayerGroup | null = null;
  let tileLayer: TileLayer | null = null;
  let darkMq: MediaQueryList | null = null;
  let bodyObserver: MutationObserver | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let showSearchArea = $state(false);
  let skipNextFit = false;
  let suppressMoveEnd = false;
  let suppressPopupMoveEnd = false;
  let searchCenter: { lat: number; lng: number } | null = null;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  // Minimum displacement (degrees) before "Search this area" appears.
  // ~0.05° ≈ 5 km at the equator — small enough to feel responsive,
  // large enough to suppress accidental nudges.
  const SEARCH_THRESHOLD = 0.3;

  const mappableMeetings = $derived(meetings.filter((m) => m.isInPerson && m.latitude && m.longitude));

  function buildPopupContent(group: ProcessedMeeting[]): HTMLElement {
    const div = document.createElement('div');
    div.style.cssText = 'min-width:180px';
    for (const m of group) {
      const row = document.createElement('div');
      row.style.cssText = 'cursor:pointer;padding:4px 0;border-bottom:1px solid var(--bmlt-divider)';
      row.innerHTML = `<strong style="display:block;font-size:13px;color:var(--bmlt-text)">${m.meeting_name}</strong><span style="font-size:12px;color:var(--bmlt-text-secondary)">${m.dayName} ${m.formattedTime}</span>`;
      row.addEventListener('click', () => selectMeeting(m));
      div.appendChild(row);
    }

    div.insertAdjacentHTML(
      'beforeend',
      `<a href="${getDirectionsUrl(group[0])}" target="_blank" rel="noopener noreferrer" class="bmlt-btn-secondary" style="margin-top:8px;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid;text-decoration:none;font-family:inherit">${$t.getDirections}</a>`
    );

    return div;
  }

  function renderMarkers(): void {
    if (!leafletMap || !markersLayer) return;

    markersLayer.clearLayers();

    if (mappableMeetings.length === 0) return;

    const groups: Record<string, ProcessedMeeting[]> = {};
    for (const m of mappableMeetings) {
      const key = `${m.latitude},${m.longitude}`;
      groups[key] ??= [];
      groups[key].push(m);
    }

    const markers: Marker[] = [];
    for (const [key, group] of Object.entries(groups)) {
      const [lat, lng] = key.split(',').map(Number);
      const marker = L.marker([lat, lng], { icon: buildMarkerIcon(locationMarker ?? DEFAULT_LOCATION_MARKER) });
      marker.bindPopup(buildPopupContent(group));
      marker.addTo(markersLayer!);
      markers.push(marker);
    }

    if (markers.length > 0 && !skipNextFit) {
      suppressMoveEnd = true;
      const group = L.featureGroup(markers);
      leafletMap.fitBounds(group.getBounds().pad(0.1));
    }
    skipNextFit = false;
  }

  const DEFAULT_TILES: TilesConfig = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  };

  function applyTileLayer(cfg: TilesConfig): void {
    if (!leafletMap) return;
    if (tileLayer) {
      tileLayer.remove();
    }
    tileLayer = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: 19 });
    tileLayer.addTo(leafletMap);
  }

  function isDarkMode(): boolean {
    if (document.body.classList.contains('dark')) return true;
    if (document.body.classList.contains('light')) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function onColorSchemeChange(): void {
    applyTileLayer(isDarkMode() && tilesDark ? tilesDark : (tiles ?? DEFAULT_TILES));
  }

  function handleSearchArea(): void {
    if (!leafletMap || !onsearcharea) return;
    const center = leafletMap.getCenter();
    searchCenter = { lat: center.lat, lng: center.lng };
    showSearchArea = false;
    skipNextFit = true;
    onsearcharea(center.lat, center.lng);
  }

  onMount(() => {
    leafletMap = L.map(mapEl);
    leafletMap.on('popupopen', () => {
      suppressPopupMoveEnd = true;
    });

    leafletMap.on('moveend', () => {
      if (suppressMoveEnd) {
        suppressMoveEnd = false;
        // Capture the post-fit center as the new search baseline
        const c = leafletMap!.getCenter();
        searchCenter = { lat: c.lat, lng: c.lng };
        return;
      }
      if (suppressPopupMoveEnd) {
        suppressPopupMoveEnd = false;
        return;
      }
      if (geoActive && onsearcharea && searchCenter) {
        const c = leafletMap!.getCenter();
        const dist = Math.sqrt(Math.pow(c.lat - searchCenter.lat, 2) + Math.pow(c.lng - searchCenter.lng, 2));
        showSearchArea = dist > SEARCH_THRESHOLD;
      }
    });

    darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    applyTileLayer(isDarkMode() && tilesDark ? tilesDark : (tiles ?? DEFAULT_TILES));

    if (tilesDark) {
      darkMq.addEventListener('change', onColorSchemeChange);
      bodyObserver = new MutationObserver(onColorSchemeChange);
      bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    markersLayer = L.layerGroup().addTo(leafletMap);
    renderMarkers();

    // Debounce invalidateSize to prevent iOS address-bar resize events from
    // firing mid-tap, which shifts map geometry and causes Leaflet's tap handler
    // to miss the marker and never open the popup.
    resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => leafletMap?.invalidateSize(), 200);
    });
    resizeObserver.observe(mapEl);
  });

  onDestroy(() => {
    clearTimeout(resizeTimer);
    resizeObserver?.disconnect();
    bodyObserver?.disconnect();
    darkMq?.removeEventListener('change', onColorSchemeChange);
    leafletMap?.remove();
  });

  $effect(() => {
    // Re-render when filtered meetings change; reading mappableMeetings tracks the dependency
    const _len = mappableMeetings.length;
    if (_len >= 0 && leafletMap && markersLayer) {
      renderMarkers();
    }
  });
</script>

<div class="relative h-full w-full">
  <div bind:this={mapEl} class="h-full min-h-96 w-full"></div>

  {#if showSearchArea && geoActive && onsearcharea}
    <div class="pointer-events-none absolute top-3 right-0 left-0 z-[1000] flex justify-center">
      <button onclick={handleSearchArea} class="bmlt-map-search-btn pointer-events-auto rounded-full border px-4 py-2 text-sm font-medium shadow-lg">
        {$t.searchThisArea}
      </button>
    </div>
  {/if}

  {#if !mappableMeetings.length}
    <div class="bmlt-map-empty absolute inset-0 flex items-center justify-center backdrop-blur-sm">
      <p class="text-sm" style="color:var(--bmlt-text-secondary)">{$t.noInPersonMeetings}</p>
    </div>
  {/if}
</div>
