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
  }

  const { meetings, locationMarker, tiles, tilesDark }: Props = $props();

  let mapEl: HTMLDivElement;
  let leafletMap: LeafletMap | null = null;
  let markersLayer: LayerGroup | null = null;
  let tileLayer: TileLayer | null = null;
  let darkMq: MediaQueryList | null = null;

  const mappableMeetings = $derived(meetings.filter((m) => m.isInPerson && m.latitude && m.longitude));

  function buildPopupContent(group: ProcessedMeeting[]): HTMLElement {
    const div = document.createElement('div');
    div.style.cssText = 'min-width:180px';
    for (const m of group) {
      const row = document.createElement('div');
      row.style.cssText = 'cursor:pointer;padding:4px 0;border-bottom:1px solid #eee';
      row.innerHTML = `<strong style="display:block;font-size:13px">${m.meeting_name}</strong><span style="font-size:12px;color:#666">${m.dayName} ${m.formattedTime}</span>`;
      row.addEventListener('click', () => selectMeeting(m.id_bigint));
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

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      leafletMap.fitBounds(group.getBounds().pad(0.1));
    }
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

  function onColorSchemeChange(e: MediaQueryListEvent): void {
    applyTileLayer(e.matches && tilesDark ? tilesDark : (tiles ?? DEFAULT_TILES));
  }

  onMount(() => {
    leafletMap = L.map(mapEl);

    darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = darkMq.matches && !!tilesDark;
    applyTileLayer(isDark ? tilesDark! : (tiles ?? DEFAULT_TILES));

    if (tilesDark) {
      darkMq.addEventListener('change', onColorSchemeChange);
    }

    markersLayer = L.layerGroup().addTo(leafletMap);
    renderMarkers();
  });

  onDestroy(() => {
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

  {#if !mappableMeetings.length}
    <div class="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <p class="text-sm text-gray-500">{$t.noInPersonMeetings}</p>
    </div>
  {/if}
</div>
