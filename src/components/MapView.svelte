<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import type { Map as LeafletMap, Marker, LayerGroup, TileLayer, CircleMarker } from 'leaflet';
  import type { ProcessedMeeting, MarkerConfig, TilesConfig } from '@/types';
  import { selectMeeting } from '@stores/ui.svelte';
  import { config } from '@stores/config.svelte';
  import { getDirectionsUrl } from '@utils/format';
  import { DEFAULT_LOCATION_MARKER, buildMarkerIcon } from '@utils/markers';
  import { observeMapResize, buildDirectionsLinkHtml, resolveTileConfig, applyTileLayer } from '@utils/mapUtils';
  import { t } from '@stores/localization';

  interface Props {
    meetings: ProcessedMeeting[];
    locationMarker?: MarkerConfig;
    tiles?: TilesConfig;
    tilesDark?: TilesConfig;
    geoActive?: boolean;
    userLocation?: { lat: number; lng: number };
    onsearcharea?: (lat: number, lng: number) => void;
  }

  const { meetings, locationMarker, tiles, tilesDark, geoActive = false, userLocation, onsearcharea }: Props = $props();

  let mapEl: HTMLDivElement;
  let leafletMap: LeafletMap | null = null;
  let markersLayer: LayerGroup | null = null;
  let userLocationMarker: CircleMarker | null = null;
  let tileLayer: TileLayer | null = null;
  let darkMq: MediaQueryList | null = null;
  let bodyObserver: MutationObserver | null = null;
  let destroyResizeObserver: (() => void) | null = null;
  let showSearchArea = $state(false);
  let skipNextFit = false;
  let suppressMoveEnd = false;
  let suppressPopupMoveEnd = false;
  let searchCenter: { lat: number; lng: number } | null = null;
  let currentTileUrl: string | null = null;
  // Minimum displacement (degrees) before "Search this area" appears.
  // ~0.05° ≈ 5 km at the equator — small enough to feel responsive,
  // large enough to suppress accidental nudges.
  const SEARCH_THRESHOLD = 0.3;

  const mappableMeetings = $derived(meetings.filter((m) => m.isInPerson && m.latitude && m.longitude));

  function buildPopupContent(group: ProcessedMeeting[]): HTMLElement {
    const div = document.createElement('div');
    div.style.cssText = 'min-width:180px;max-width:240px;word-break:break-word;white-space:normal';
    for (const m of group) {
      const row = document.createElement('div');
      row.style.cssText = 'cursor:pointer;padding:4px 0;border-bottom:1px solid var(--bmlt-divider)';
      row.innerHTML = `<strong style="display:block;font-size:13px;color:var(--bmlt-text)">${m.meeting_name}</strong><span style="font-size:12px;color:var(--bmlt-text-secondary)">${$t.weekdays[m.weekday_tinyint - 1]} ${m.formattedTime}</span>`;
      row.addEventListener('click', () => selectMeeting(m));
      div.appendChild(row);
    }

    div.insertAdjacentHTML('beforeend', buildDirectionsLinkHtml(getDirectionsUrl(group[0]!), $t.getDirections));

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
      const [lat, lng] = key.split(',').map(Number) as [number, number];
      const label = group.map((m) => m.meeting_name).join(', ');
      const marker = L.marker([lat, lng], {
        icon: buildMarkerIcon(locationMarker ?? DEFAULT_LOCATION_MARKER),
        alt: label
      });
      marker.bindPopup(buildPopupContent(group), { maxWidth: 240, maxHeight: 260 });
      marker.addTo(markersLayer!);
      const markerEl = marker.getElement();
      markerEl?.setAttribute('aria-label', label);
      markerEl?.querySelector('img')?.setAttribute('alt', label);
      markers.push(marker);
    }

    if (markers.length > 0 && !skipNextFit) {
      suppressMoveEnd = true;
      const group = L.featureGroup(markers);
      leafletMap.fitBounds(group.getBounds().pad(0.1));
    }
    skipNextFit = false;
  }

  function renderUserLocation(): void {
    if (!leafletMap) return;
    userLocationMarker?.remove();
    userLocationMarker = null;
    if (!userLocation) return;
    userLocationMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 8,
      color: '#ffffff',
      weight: 2,
      fillColor: '#2563eb',
      fillOpacity: 1,
      pane: 'userLocationPane'
    });
    userLocationMarker.bindTooltip($t.yourLocation, { permanent: false, direction: 'top' });
    userLocationMarker.addTo(leafletMap);
  }

  function updateTiles(): void {
    if (!leafletMap) return;
    const result = applyTileLayer(leafletMap, resolveTileConfig(config.containerId, tiles, tilesDark), tileLayer, currentTileUrl);
    tileLayer = result.layer;
    currentTileUrl = result.url;
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
    leafletMap.createPane('userLocationPane').style.zIndex = '650';
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
    updateTiles();

    if (tilesDark) {
      darkMq.addEventListener('change', updateTiles);
      bodyObserver = new MutationObserver(() => updateTiles());
      const containerEl = document.getElementById(config.containerId) ?? document.body;
      bodyObserver.observe(containerEl, { attributes: true, attributeFilter: ['class'] });
    }

    markersLayer = L.layerGroup().addTo(leafletMap);
    renderMarkers();
    renderUserLocation();

    // Debounce invalidateSize to prevent iOS address-bar resize events from
    // firing mid-tap, which shifts map geometry and causes Leaflet's tap handler
    // to miss the marker and never open the popup.
    destroyResizeObserver = observeMapResize(mapEl, () => leafletMap?.invalidateSize());
  });

  onDestroy(() => {
    destroyResizeObserver?.();
    bodyObserver?.disconnect();
    darkMq?.removeEventListener('change', updateTiles);
    leafletMap?.off('popupopen');
    leafletMap?.off('moveend');
    leafletMap?.remove();
  });

  $effect(() => {
    // Reading mappableMeetings.length tracks it as a reactive dependency
    const _len = mappableMeetings.length;
    void _len;
    if (leafletMap && markersLayer) {
      renderMarkers();
    }
  });

  $effect(() => {
    // Read userLocation at top level so it's always tracked as a dependency,
    // even if leafletMap isn't set yet on the first run.
    const _loc = userLocation;
    void _loc;
    if (leafletMap) {
      renderUserLocation();
    }
  });
</script>

<div class="bmlt-map-container relative h-full w-full overflow-hidden">
  <div bind:this={mapEl} class="h-full min-h-96 w-full"></div>

  {#if showSearchArea && geoActive && onsearcharea}
    <div class="pointer-events-none absolute right-0 bottom-3 left-0 z-[1000] flex justify-center">
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
