<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import type { Map as LeafletMap, TileLayer } from 'leaflet';
  import type { ProcessedMeeting, TilesConfig } from '@/types';
  import { config } from '@stores/config.svelte';
  import { getDirectionsUrl, getConferenceProvider } from '@utils/format';
  import { DEFAULT_LOCATION_MARKER, buildMarkerIcon } from '@utils/markers';
  import { t } from '@stores/localization';

  interface Props {
    meeting: ProcessedMeeting;
  }

  const { meeting }: Props = $props();

  const showMap = $derived(meeting.isInPerson && !!meeting.latitude && !!meeting.longitude);

  const DEFAULT_TILES: TilesConfig = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  };

  let mapEl = $state<HTMLDivElement | undefined>();
  let leafletMap: LeafletMap | null = null;
  let tileLayer: TileLayer | null = null;
  let darkMq: MediaQueryList | null = null;

  function applyTileLayer(cfg: TilesConfig): void {
    if (!leafletMap) return;
    tileLayer?.remove();
    tileLayer = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: 19 });
    tileLayer.addTo(leafletMap);
  }

  function onColorSchemeChange(e: MediaQueryListEvent): void {
    applyTileLayer(e.matches && config.tilesDark ? config.tilesDark : (config.tiles ?? DEFAULT_TILES));
  }

  onMount(() => {
    if (!showMap || !mapEl) return;

    leafletMap = L.map(mapEl).setView([meeting.latitude, meeting.longitude], 15);

    darkMq = window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = darkMq.matches && !!config.tilesDark;
    applyTileLayer(isDark ? config.tilesDark! : (config.tiles ?? DEFAULT_TILES));

    if (config.tilesDark) {
      darkMq.addEventListener('change', onColorSchemeChange);
    }

    const popupHtml = `<div style="min-width:180px">
      <p style="font-size:13px;margin:0 0 8px">${meeting.formattedAddress}</p>
      <a href="${getDirectionsUrl(meeting)}" target="_blank" rel="noopener noreferrer" class="bmlt-btn-secondary" style="margin-top:4px;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;font-size:12px;border-radius:6px;border:1px solid;text-decoration:none;font-family:inherit">${$t.getDirections}</a>
    </div>`;

    L.marker([meeting.latitude, meeting.longitude], {
      icon: buildMarkerIcon(config.locationMarker ?? DEFAULT_LOCATION_MARKER)
    })
      .bindPopup(popupHtml)
      .addTo(leafletMap!);
  });

  onDestroy(() => {
    darkMq?.removeEventListener('change', onColorSchemeChange);
    leafletMap?.remove();
  });
</script>

<div class="flex h-full flex-col">
  <!-- Header -->
  <div class="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
    <button onclick={() => history.back()} class="bmlt-link mb-1.5 flex cursor-pointer items-center gap-1 text-base text-blue-600 hover:text-blue-800">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      {$t.backToMeetings}
    </button>
    <h2 class="text-2xl font-bold text-gray-900">{meeting.meeting_name}</h2>
  </div>

  <!-- Body: two columns -->
  <div class="flex min-h-0 flex-1 flex-col sm:flex-row">
    <!-- Left: scrollable info panel -->
    <div class="overflow-y-auto p-4 {showMap ? 'shrink-0 sm:w-72 sm:border-r sm:border-gray-200 lg:w-80' : 'mx-auto w-full max-w-lg'}">
      <!-- Get Directions (in-person) -->
      {#if meeting.isInPerson && meeting.formattedAddress}
        <a
          href={getDirectionsUrl(meeting)}
          target="_blank"
          rel="noopener noreferrer"
          class="bmlt-btn-secondary mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-base font-medium text-gray-700 no-underline transition-colors hover:bg-gray-50"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <p class="text-base font-semibold text-gray-800">Meeting Information</p>
        </div>

        <!-- Schedule row -->
        <div class="px-4 py-4">
          <p class="text-sm font-semibold tracking-wide text-gray-400 uppercase">{$t.schedule}</p>
          <p class="mt-1 text-base font-medium text-gray-900">
            {meeting.dayName}
            {$t.at}
            {meeting.formattedTime}
            {#if meeting.time_zone}
              <span class="font-normal text-gray-500">({meeting.time_zone})</span>
            {/if}
          </p>
          {#if meeting.duration_time && meeting.duration_time !== '01:00:00'}
            <p class="mt-0.5 text-sm text-gray-500">{$t.duration}: {meeting.duration_time.slice(0, 5).replace(/^0/, '')}</p>
          {/if}
        </div>

        <!-- Venue + formats row -->
        <div class="px-4 py-4">
          <p class="text-sm font-semibold tracking-wide text-gray-400 uppercase">{$t.venueType}</p>
          <div class="mt-1 flex flex-wrap gap-1.5">
            {#if meeting.isInPerson}
              <span class="bmlt-badge-in-person inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-sm font-medium text-green-700">{$t.inPerson}</span>
            {/if}
            {#if meeting.isVirtual}
              <span class="bmlt-badge-virtual inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-sm font-medium text-blue-700">{$t.virtual}</span>
            {/if}
          </div>
          {#if meeting.resolvedFormats.length > 0}
            <div class="mt-2 flex flex-wrap gap-1">
              {#each meeting.resolvedFormats as fmt (fmt.id)}
                <span class="rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-600" title={fmt.description_string}>{fmt.name_string}</span>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Address row (in-person) -->
        {#if meeting.isInPerson && meeting.formattedAddress}
          <div class="px-4 py-4">
            <p class="text-sm font-semibold tracking-wide text-gray-400 uppercase">{$t.address}</p>
            {#if meeting.location_text}
              <p class="mt-1 text-base font-medium text-gray-900">{meeting.location_text}</p>
            {/if}
            <p class="mt-0.5 text-base text-gray-700">{meeting.formattedAddress}</p>
            {#if meeting.location_info}
              <p class="mt-0.5 text-sm text-gray-500">{meeting.location_info}</p>
            {/if}
          </div>
        {/if}

        <!-- Online meeting row -->
        {#if meeting.isVirtual && (meeting.virtual_meeting_link || meeting.virtual_meeting_additional_info)}
          <div class="px-4 py-4">
            <p class="text-sm font-semibold tracking-wide text-gray-400 uppercase">{$t.onlineMeetingSection}</p>
            {#if meeting.virtual_meeting_link}
              <a
                href={meeting.virtual_meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                class="bmlt-btn-primary mt-1.5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-base font-medium text-white transition-all hover:brightness-90"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p class="text-sm font-semibold tracking-wide text-gray-400 uppercase">{$t.notes}</p>
            <p class="mt-1 text-base text-gray-600">{meeting.comments}</p>
          </div>
        {/if}

        <!-- Service body row -->
        {#if meeting.service_body_name}
          <div class="px-4 py-4">
            <p class="text-sm font-semibold tracking-wide text-gray-400 uppercase">{$t.serviceBody}</p>
            <p class="mt-1 text-base text-gray-700">{meeting.service_body_name}</p>
          </div>
        {/if}

        <!-- Contact row -->
        {#if meeting.email_contact}
          <div class="px-4 py-4">
            <p class="text-sm font-semibold tracking-wide text-gray-400 uppercase">{$t.contact}</p>
            <a href="mailto:{meeting.email_contact}" class="bmlt-link mt-1 block text-base text-blue-600 hover:text-blue-800">
              {meeting.email_contact}
            </a>
          </div>
        {/if}
      </div>
    </div>

    <!-- Right: map (in-person with coords only) -->
    {#if showMap}
      <div class="min-h-64 flex-1 sm:min-h-0">
        <div bind:this={mapEl} class="h-full min-h-64 w-full"></div>
      </div>
    {/if}
  </div>
</div>
