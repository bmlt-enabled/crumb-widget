<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import type { Map as LeafletMap, TileLayer } from 'leaflet';
  import type { ProcessedMeeting } from '@/types';

  import { config } from '@stores/config.svelte';
  import { getDirectionsUrl, getConferenceProvider, formatTime, formatEndTime, getTimezoneAbbr, meetingSlug } from '@utils/format';
  import { DEFAULT_LOCATION_MARKER, buildMarkerIcon } from '@utils/markers';
  import { observeMapResize, buildDirectionsLinkHtml, resolveTileConfig, applyTileLayer } from '@utils/mapUtils';
  import { t } from '@stores/localization';

  interface Props {
    meeting: ProcessedMeeting;
    allMeetings?: ProcessedMeeting[];
  }

  const { meeting, allMeetings = [] }: Props = $props();

  const siblingMeetings = $derived(
    allMeetings.filter(
      (m) =>
        m.id_bigint !== meeting.id_bigint &&
        m.isInPerson &&
        meeting.isInPerson &&
        m.location_street &&
        m.location_street === meeting.location_street &&
        m.location_municipality === meeting.location_municipality
    )
  );

  const showMap = $derived(meeting.isInPerson && !!meeting.latitude && !!meeting.longitude);

  let activeFmtId = $state<string | null>(null);

  let mapEl = $state<HTMLDivElement | undefined>();
  let leafletMap: LeafletMap | null = null;
  let tileLayer: TileLayer | null = null;
  let currentTileUrl: string | null = null;
  let darkMq: MediaQueryList | null = null;
  let bodyObserver: MutationObserver | null = null;
  let destroyResizeObserver: (() => void) | null = null;

  function updateTiles(): void {
    if (!leafletMap) return;
    const result = applyTileLayer(leafletMap, resolveTileConfig(config.containerId, config.tiles, config.tilesDark), tileLayer, currentTileUrl);
    tileLayer = result.layer;
    currentTileUrl = result.url;
  }

  onMount(() => {
    if (!showMap || !mapEl) return;

    leafletMap = L.map(mapEl).setView([meeting.latitude, meeting.longitude], 17);

    darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    updateTiles();

    if (config.tilesDark) {
      darkMq.addEventListener('change', updateTiles);
      bodyObserver = new MutationObserver(() => updateTiles());
      const containerEl = document.getElementById(config.containerId) ?? document.body;
      bodyObserver.observe(containerEl, { attributes: true, attributeFilter: ['class'] });
    }

    const popupHtml = `<div style="min-width:180px;max-width:240px;word-break:break-word;white-space:normal">
      ${meeting.location_text ? `<strong style="display:block;font-size:16px;color:var(--bmlt-text);margin:0 0 6px">${meeting.location_text}</strong>` : ''}
      <p style="font-size:14px;color:var(--bmlt-text-secondary);margin:0 0 8px">${meeting.formattedAddress}</p>
      ${buildDirectionsLinkHtml(getDirectionsUrl(meeting), $t.getDirections, '4px')}
    </div>`;

    const marker = L.marker([meeting.latitude, meeting.longitude], {
      icon: buildMarkerIcon(config.locationMarker ?? DEFAULT_LOCATION_MARKER)
    });
    marker.bindPopup(popupHtml, { maxWidth: 260 }).addTo(leafletMap!).openPopup();
    const markerEl = marker.getElement();
    markerEl?.setAttribute('aria-label', meeting.meeting_name);
    markerEl?.querySelector('img')?.setAttribute('alt', meeting.meeting_name);

    destroyResizeObserver = observeMapResize(mapEl, () => leafletMap?.invalidateSize());
  });

  onDestroy(() => {
    destroyResizeObserver?.();
    bodyObserver?.disconnect();
    darkMq?.removeEventListener('change', updateTiles);
    leafletMap?.remove();
  });
</script>

<div class="bmlt-detail flex h-full flex-col">
  <!-- Header -->
  <div class="bmlt-detail-header shrink-0 border-b border-gray-200 bg-white px-4 py-3">
    <h2 class="text-3xl font-bold text-gray-900">{meeting.meeting_name}</h2>
    <a href="#/" class="bmlt-link mt-1.5 flex items-center gap-1 text-base text-blue-600 hover:text-blue-800">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      {$t.backToMeetings}
    </a>
  </div>

  <!-- Body: two columns -->
  <div class="flex min-h-0 flex-1 flex-col sm:flex-row">
    <!-- Left: scrollable info panel -->
    <div class="overflow-y-auto py-4 {showMap ? 'shrink-0 sm:w-[40%] sm:border-r sm:border-gray-200' : 'mx-auto w-full max-w-lg'}">
      <!-- Get Directions (in-person) -->
      {#if meeting.isInPerson && meeting.formattedAddress}
        <a
          href={getDirectionsUrl(meeting)}
          target="_blank"
          rel="noopener noreferrer"
          class="bmlt-btn-secondary mx-4 mb-4 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-base font-medium no-underline transition-colors"
        >
          <svg class="h-4 w-4" style="fill:none;stroke:currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {$t.getDirections}
        </a>
      {/if}

      <!-- Unified info card -->
      <div class="bmlt-card divide-y divide-gray-100 rounded-lg border border-gray-200">
        <!-- Card header -->
        <div class="bg-gray-50 px-4 py-2.5 first:rounded-t-lg">
          <p class="text-base font-semibold text-gray-800">{$t.meetingInformation}</p>
        </div>

        <!-- Schedule row -->
        <div class="px-4 py-4">
          <div>
            <p class="text-lg font-medium text-gray-900">
              {$t.weekdays[meeting.weekday_tinyint - 1]},
              {#if meeting.duration_time && formatEndTime(meeting.start_time, meeting.duration_time)}
                {formatTime(meeting.start_time)} – {formatEndTime(meeting.start_time, meeting.duration_time)}
              {:else}
                {meeting.formattedTime}
              {/if}
              {#if meeting.time_zone}
                <span class="text-base font-normal text-gray-500">{getTimezoneAbbr(meeting.time_zone)}</span>
              {/if}
            </p>
          </div>
        </div>

        <!-- Venue + formats row -->
        <div class="px-4 py-4">
          <div class="flex flex-wrap gap-1.5">
            {#if meeting.isInPerson}
              <span class="bmlt-badge-in-person inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-700">{$t.inPerson}</span>
            {/if}
            {#if meeting.isVirtual}
              <span class="bmlt-badge-virtual inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-700">{$t.virtual}</span>
            {/if}
          </div>
          {#if meeting.resolvedFormats.length > 0}
            <div class="mt-1.5 flex flex-wrap gap-1">
              {#each meeting.resolvedFormats as fmt (fmt.id)}
                <button
                  class="cursor-pointer appearance-none rounded border-0 bg-gray-100 px-2.5 py-1 text-base text-gray-600 select-none"
                  style="font-family:inherit"
                  title={fmt.description_string}
                  onclick={() => {
                    activeFmtId = activeFmtId === fmt.id ? null : fmt.id;
                  }}>{fmt.name_string}</button
                >
              {/each}
              {#if activeFmtId}
                {@const activeFmt = meeting.resolvedFormats.find((f) => f.id === activeFmtId)}
                {#if activeFmt?.description_string}
                  <p class="w-full text-sm text-gray-500 sm:hidden">{activeFmt.description_string}</p>
                {/if}
              {/if}
            </div>
          {/if}
        </div>

        <!-- Address row (in-person) -->
        {#if meeting.isInPerson && meeting.formattedAddress}
          <div class="px-4 py-4">
            <div class="mt-1">
              {#if meeting.location_text}
                <p class="text-base font-semibold text-gray-700">{meeting.location_text}</p>
              {/if}
              <p class="text-base text-gray-700">{meeting.formattedAddress}</p>
              {#if meeting.location_info}
                <p class="mt-2 text-sm text-gray-500">{meeting.location_info}</p>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Online meeting row -->
        {#if meeting.isVirtual && (meeting.virtual_meeting_link || meeting.virtual_meeting_additional_info)}
          <div class="px-4 py-4">
            {#if meeting.virtual_meeting_link}
              <a
                href={meeting.virtual_meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                class="bmlt-btn-primary flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-base font-medium text-white transition-all hover:brightness-90"
              >
                <svg class="h-4 w-4" style="fill:none;stroke:currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                {getConferenceProvider(meeting.virtual_meeting_link ?? '') ?? $t.joinMeeting}
              </a>
            {/if}
            {#if meeting.virtual_meeting_additional_info}
              <p class="mt-1.5 text-sm text-gray-600">{meeting.virtual_meeting_additional_info}</p>
            {/if}
          </div>
        {/if}

        <!-- Notes row -->
        {#if meeting.comments}
          <div class="px-4 py-4">
            <p class="text-sm font-semibold tracking-wide text-gray-500 uppercase">{$t.notes}</p>
            <p class="mt-1 text-base text-gray-600">{meeting.comments}</p>
          </div>
        {/if}

        <!-- Service body row -->
        {#if meeting.service_body_name}
          <div class="px-4 py-4">
            <p class="text-sm font-semibold tracking-wide text-gray-500 uppercase">{$t.serviceBody}</p>
            <p class="mt-1 text-base text-gray-700">{meeting.service_body_name}</p>
          </div>
        {/if}

        <!-- Contact row -->
        {#if meeting.email_contact}
          <div class="px-4 py-4">
            <p class="text-sm font-semibold tracking-wide text-gray-500 uppercase">{$t.contact}</p>
            <a href="mailto:{meeting.email_contact}" class="bmlt-link mt-1 block text-base text-blue-600 hover:text-blue-800">
              {meeting.email_contact}
            </a>
          </div>
        {/if}

        <!-- Other meetings at this location -->
        {#if siblingMeetings.length > 0}
          <div class="px-4 py-4">
            <p class="text-sm font-semibold tracking-wide text-gray-500 uppercase">{$t.alsoAtThisLocation}</p>
            <div class="mt-2 divide-y divide-gray-100">
              {#each siblingMeetings as sibling (sibling.id_bigint)}
                <div class="flex items-center justify-between py-2">
                  <div>
                    <p class="text-sm font-semibold text-gray-800">{$t.weekdays[sibling.weekday_tinyint - 1]}</p>
                    <p class="text-sm text-gray-500">{sibling.formattedTime}</p>
                  </div>
                  <a href="#/{meetingSlug(sibling)}" class="bmlt-link text-sm text-blue-600 hover:text-blue-800">{sibling.meeting_name}</a>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Right: map (in-person with coords only) -->
    {#if showMap}
      <div class="min-h-[28rem] flex-1 sm:min-h-0">
        <div bind:this={mapEl} class="h-full min-h-[28rem] w-full"></div>
      </div>
    {/if}
  </div>
</div>
