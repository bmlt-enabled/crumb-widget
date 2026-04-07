<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from '@bmlt-enabled/svelte-spa-router';
  import type { AppConfig, ProcessedMeeting } from '@/types';
  import { loadData, loadDataByCoordinates, dataState } from '@stores/data.svelte';
  import { uiState } from '@stores/ui.svelte';
  import { filterMeetings, getGeoErrorMessage } from '@utils/format';
  import { t } from '@stores/localization';

  const GEOLOCATION_TIMEOUT_MS = 10000;
  import Controls from '@components/Controls.svelte';
  import MeetingList from '@components/MeetingList.svelte';
  import MeetingDetail from '@components/MeetingDetail.svelte';
  import MapView from '@components/MapView.svelte';
  import Loading from '@components/Loading.svelte';

  interface Props {
    config: AppConfig;
  }

  const { config }: Props = $props();

  onMount(async () => {
    const viewParam = new URLSearchParams(window.location.search).get('view'); // 'list' | 'map' | 'auto' | null

    // Determine whether to attempt geolocation on load
    const tryGeo = viewParam === 'auto' || (!viewParam && config.geolocation);

    // Set initial view (before data loads so map renders immediately if needed)
    if (viewParam === 'map' || (!viewParam && !config.geolocation && config.defaultView === 'map')) {
      uiState.view = 'map';
    }

    if (tryGeo) {
      if (!navigator.geolocation) {
        dataState.error = $t.locationError;
      } else {
        dataState.loading = true;
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await loadDataByCoordinates(config.serverUrl, pos.coords.latitude, pos.coords.longitude, config.geolocationRadius);
            if (!dataState.error) {
              uiState.geoActive = true;
            }
          },
          (err) => {
            dataState.error = getGeoErrorMessage(err.code, $t);
            dataState.loading = false;
          },
          { timeout: GEOLOCATION_TIMEOUT_MS }
        );
      }
    } else {
      await loadData(config.serverUrl, config.serviceBodyIds);
    }
  });

  const filteredMeetings = $derived(filterMeetings(dataState.meetings, uiState.filters));

  // Derive selected meeting from the current hash route: #/{slug}-{id}
  const selectedMeeting = $derived.by((): ProcessedMeeting | undefined => {
    const match = router.location.match(/^\/(.+)-(\d+)$/);
    if (!match) return undefined;
    const id = match[2];
    return dataState.meetings.find((m) => m.id_bigint === id);
  });
</script>

<div
  class="crumb-widget isolate flex flex-col rounded-lg border border-gray-200 font-sans text-base {config.height ? 'overflow-hidden' : ''}"
  style={config.height ? `height: ${config.height}px` : ''}
>
  <!-- Header -->
  {#if !config.hideHeader}
    <div class="bmlt-app-header flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
      <h1 class="text-lg font-bold text-gray-800">Meeting Finder</h1>
      {#if !dataState.loading && !dataState.error}
        <span class="text-xs text-gray-500">{dataState.meetings.length} meetings</span>
      {/if}
    </div>
  {/if}

  {#if dataState.error}
    <!-- Error state -->
    <div class="flex flex-col items-center justify-center py-16 text-center">
      <svg class="mb-3 h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <p class="text-sm font-medium text-red-700">Error loading meetings</p>
      <p class="mt-1 max-w-sm text-xs text-gray-500">{dataState.error}</p>
    </div>
  {:else if dataState.loading}
    <Loading />
  {:else if selectedMeeting}
    <!-- Detail view (no Controls) -->
    <div class={config.height ? 'min-h-0 flex-1 overflow-y-auto' : ''}>
      <MeetingDetail meeting={selectedMeeting} allMeetings={dataState.meetings} />
    </div>
  {:else}
    <!-- Controls + list/map -->
    <Controls />
    <div class="relative {config.height ? 'min-h-0 flex-1 overflow-hidden' : ''}">
      {#if uiState.view === 'map'}
        <MapView
          meetings={filteredMeetings}
          locationMarker={config.locationMarker}
          tiles={config.tiles}
          tilesDark={config.tilesDark}
          geoActive={uiState.geoActive}
          onsearcharea={async (lat, lng) => {
            await loadDataByCoordinates(config.serverUrl, lat, lng, config.geolocationRadius);
          }}
        />
      {:else}
        <div class={config.height ? 'bmlt-meeting-list h-full overflow-y-auto' : 'bmlt-meeting-list'}>
          <!-- Print-only header: shows when paper prints but not on screen. -->
          <div class="bmlt-print-header">
            <h1>{$t.meetings ?? 'Meetings'}</h1>
            <p>
              {filteredMeetings.length}
              {filteredMeetings.length === 1 ? ($t.meeting ?? 'meeting') : ($t.meetings ?? 'meetings')}
              — {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <MeetingList meetings={filteredMeetings} />
        </div>
      {/if}
    </div>
  {/if}
</div>
