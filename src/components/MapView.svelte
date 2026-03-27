<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import type { Map as LeafletMap, Marker, LayerGroup } from 'leaflet';
  import type { ProcessedMeeting } from '@/types/index';
  import { selectMeeting } from '@stores/ui.svelte';

  interface Props {
    meetings: ProcessedMeeting[];
  }

  const { meetings }: Props = $props();

  let mapEl: HTMLDivElement;
  let leafletMap: LeafletMap | null = null;
  let markersLayer: LayerGroup | null = null;

  // Fix default icon URLs broken by bundlers
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  });

  const mappableMeetings = $derived(meetings.filter((m) => (m.isInPerson || m.isHybrid) && m.latitude && m.longitude));

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
      const marker = L.marker([lat, lng]);
      marker.bindPopup(buildPopupContent(group));
      marker.addTo(markersLayer!);
      markers.push(marker);
    }

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      leafletMap.fitBounds(group.getBounds().pad(0.1));
    }
  }

  onMount(() => {
    leafletMap = L.map(mapEl);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(leafletMap);
    markersLayer = L.layerGroup().addTo(leafletMap);
    renderMarkers();
  });

  onDestroy(() => {
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

  {#if !mappableMeetings.length && meetings.length > 0}
    <div class="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <p class="text-sm text-gray-500">No in-person meetings to show on map with current filters</p>
    </div>
  {/if}
</div>
