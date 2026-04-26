<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from '@bmlt-enabled/svelte-spa-router';
  import type { AppConfig, ProcessedMeeting } from '@/types';
  import { loadData, loadDataByCoordinates, dataState } from '@stores/data.svelte';
  import { uiState } from '@stores/ui.svelte';
  import { filterMeetings, getGeoErrorMessage } from '@utils/format';
  import { GEOLOCATION_TIMEOUT_MS } from '@utils/constants';
  import { t, direction } from '@stores/localization';

  let geoErrorHint = $state('');
  let geoDenied = $state(false);
  import Controls from '@components/Controls.svelte';
  import MeetingList from '@components/MeetingList.svelte';
  import MeetingDetail from '@components/MeetingDetail.svelte';
  import MapView from '@components/MapView.svelte';
  import Loading from '@components/Loading.svelte';
  import Icon from '@components/Icon.svelte';

  interface Props {
    config: AppConfig;
  }

  const { config }: Props = $props();

  function hasServiceBody(): boolean {
    return config.serviceBodyIds.length > 0;
  }

  async function fallbackToList() {
    config.geolocation = false;
    uiState.view = 'list';
    uiState.geoActive = false;
    await loadData(config.serverUrl, config.serviceBodyIds);
  }

  function attemptGeolocation() {
    if (!navigator.geolocation) {
      if (hasServiceBody()) {
        fallbackToList();
        return;
      }
      dataState.error = $t.locationError;
      geoErrorHint = $t.locationErrorHint;
      return;
    }
    dataState.error = '';
    geoErrorHint = '';
    geoDenied = false;
    dataState.loading = true;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        uiState.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        await loadDataByCoordinates(config.serverUrl, pos.coords.latitude, pos.coords.longitude, config.geolocationRadius);
        if (!dataState.error) {
          uiState.geoActive = true;
        }
      },
      (err) => {
        if (hasServiceBody()) {
          fallbackToList();
          return;
        }
        const msg = getGeoErrorMessage(err.code, $t);
        dataState.error = msg.title;
        geoErrorHint = msg.hint;
        geoDenied = err.code === 1;
        dataState.loading = false;
      },
      { timeout: GEOLOCATION_TIMEOUT_MS }
    );
  }

  onMount(async () => {
    const viewParam = new URLSearchParams(window.location.search).get('view'); // 'list' | 'map' | 'auto' | null

    // Determine whether to attempt geolocation on load
    const tryGeo = viewParam === 'auto' || (!viewParam && config.geolocation);

    // Set initial view (before data loads so map renders immediately if needed)
    if (viewParam === 'map' || viewParam === 'both') {
      uiState.view = viewParam;
    } else if (!viewParam && (config.view === 'map' || config.view === 'both')) {
      uiState.view = config.view;
    }

    if (tryGeo) {
      attemptGeolocation();
    } else {
      await loadData(config.serverUrl, config.serviceBodyIds);
    }
  });

  const filteredMeetings = $derived(filterMeetings(dataState.meetings, uiState.filters, uiState.userLocation, uiState.geoRadius));

  // Selected meeting: state is primary (set by selectMeeting/clearSelectedMeeting),
  // URL is fallback for deep-linking on initial load.
  const selectedMeeting = $derived.by((): ProcessedMeeting | undefined => {
    if (uiState.selectedMeetingId) {
      return dataState.meetings.find((m) => m.id_bigint === uiState.selectedMeetingId);
    }
    // Deep-link fallback: parse meeting ID from the last segment of the URL
    const loc = router.location.replace(/\/$/, '');
    const match = loc.match(/-(\d+)$/);
    if (!match) return undefined;
    return dataState.meetings.find((m) => m.id_bigint === match[1]);
  });

  let widgetEl = $state<HTMLDivElement | undefined>();

  $effect(() => {
    if (selectedMeeting && widgetEl) {
      const fixedHeaderHeight = Math.max(
        0,
        ...[...document.body.getElementsByTagName('*')]
          .filter((x) => getComputedStyle(x).position === 'fixed' && (x as HTMLElement).offsetTop < 100)
          .map((x) => (x as HTMLElement).offsetTop + (x as HTMLElement).offsetHeight)
      );
      widgetEl.style.scrollMarginTop = fixedHeaderHeight ? `${fixedHeaderHeight}px` : '';
      widgetEl.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
    }
  });
</script>

<div
  bind:this={widgetEl}
  class="crumb-widget isolate flex flex-col rounded-lg border border-gray-200 font-sans text-base {config.height ? 'overflow-hidden' : ''}"
  style={config.height ? `height: ${config.height}px` : ''}
  dir={$direction}
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
      <Icon name="map-pin" class="mb-3 h-10 w-10 text-amber-400" strokeWidth={1.5} />
      <p class="text-sm font-medium text-gray-800">{dataState.error}</p>
      {#if geoErrorHint}
        <p class="mt-1 max-w-sm text-xs text-gray-500">{geoErrorHint}</p>
      {/if}
      {#if config.geolocation && !geoDenied}
        <button onclick={attemptGeolocation} class="mt-4 rounded-lg border border-blue-500 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100">
          {$t.retry}
        </button>
      {/if}
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
          userLocation={uiState.userLocation}
          onsearcharea={async (lat, lng) => {
            await loadDataByCoordinates(config.serverUrl, lat, lng, config.geolocationRadius);
          }}
        />
      {:else if uiState.view === 'both'}
        <div class="flex flex-col {config.height ? 'h-full' : ''}">
          <div class="relative flex-none overflow-hidden" style="height: 384px">
            <MapView
              meetings={filteredMeetings}
              locationMarker={config.locationMarker}
              tiles={config.tiles}
              tilesDark={config.tilesDark}
              geoActive={uiState.geoActive}
              userLocation={uiState.userLocation}
              onsearcharea={async (lat, lng) => {
                await loadDataByCoordinates(config.serverUrl, lat, lng, config.geolocationRadius);
              }}
            />
          </div>
          <div class={config.height ? 'bmlt-meeting-list min-h-0 flex-1 overflow-y-auto' : 'bmlt-meeting-list'}>
            <MeetingList meetings={filteredMeetings} />
          </div>
        </div>
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
