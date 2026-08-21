<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from '@bmlt-enabled/svelte-spa-router';
  import { countUniqueGroups } from 'bmlt-query-client';
  import type { AppConfig, ProcessedMeeting } from '@/types';
  import { loadData, loadDataByAddress, loadDataByCoordinates, dataState } from '@stores/data.svelte';
  import { uiState } from '@stores/ui.svelte';
  import { filterMeetings, getGeoErrorMessage } from '@utils/format';
  import { GEOLOCATION_HARD_TIMEOUT_MS, GEOLOCATION_TIMEOUT_MS, SPINNER_DELAY_MS } from '@utils/constants';
  import { t, direction } from '@stores/localization';

  import Controls from '@components/Controls.svelte';
  import MeetingList from '@components/MeetingList.svelte';
  import MeetingDetail from '@components/MeetingDetail.svelte';
  import MapView from '@components/MapView.svelte';
  import Loading from '@components/Loading.svelte';
  import Icon from '@components/Icon.svelte';

  let geoErrorHint = $state('');
  let geoDenied = $state(false);
  let manualAddress = $state('');
  let showSpinner = $state(false);

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

  function reportGeoError(code: number) {
    if (hasServiceBody()) {
      fallbackToList();
      return;
    }
    const msg = getGeoErrorMessage(code, $t);
    dataState.error = msg.title;
    geoErrorHint = msg.hint;
    geoDenied = code === 1;
    dataState.loading = false;
  }

  async function attemptGeolocation() {
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

    // Skip the prompt outright if the user has already blocked location for this
    // origin — saves up to GEOLOCATION_HARD_TIMEOUT_MS of stuck spinner.
    // navigator.permissions is unavailable in some embeddings/browsers; treat
    // any failure as "unknown" and fall through to getCurrentPosition.
    try {
      const status = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
      if (status?.state === 'denied') {
        reportGeoError(1);
        return;
      }
    } catch {
      // ignore — fall through to the actual request
    }

    dataState.loading = true;

    // The browser-level `timeout` option only counts time AFTER the user
    // dismisses the permission prompt. If the prompt is ignored or silently
    // suppressed (sandboxed iframe, blocked Permissions Policy, prior site
    // block), the callbacks never fire and the spinner hangs forever. Guard
    // with a wall-clock timer that always resolves the loading state.
    let settled = false;
    const hardTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reportGeoError(3); // TIMEOUT
    }, GEOLOCATION_HARD_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (settled) return;
        settled = true;
        clearTimeout(hardTimer);
        uiState.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        await loadDataByCoordinates(config.serverUrl, pos.coords.latitude, pos.coords.longitude, config.geolocationRadius);
        if (!dataState.error) {
          uiState.geoActive = true;
        }
      },
      (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(hardTimer);
        reportGeoError(err.code);
      },
      { timeout: GEOLOCATION_TIMEOUT_MS }
    );
  }

  async function handleManualAddressSearch() {
    const query = manualAddress.trim();
    if (!query || dataState.loading) return;
    // loadDataByAddress owns dataState.loading + dataState.error; on geocode
    // failure it sets a friendly error message that takes over the page-level
    // error display. On success it clears the error and the meeting list
    // renders normally.
    geoErrorHint = '';
    geoDenied = false;
    const result = await loadDataByAddress(config.serverUrl, query, config.geolocationRadius);
    if (!result) return;
    uiState.userLocation = { lat: result.lat, lng: result.lng };
    uiState.geoActive = true;
    uiState.geoRadius = config.geolocationRadius > 0 ? config.geolocationRadius : 0;
  }

  onMount(async () => {
    const viewParam = new URLSearchParams(window.location.search).get('view'); // 'list' | 'map' | 'auto' | null

    // Determine whether to attempt geolocation on load.
    // If config.geolocation is true, always try — that's the embedder's stated intent.
    // ?view=auto forces a prompt even when config.geolocation is false.
    // ?view=list explicitly opts out, since the user has asked for "just the list".
    const tryGeo = viewParam !== 'list' && (config.geolocation || viewParam === 'auto');

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
  const groupCount = $derived(countUniqueGroups(filteredMeetings));

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

  // Delay the spinner so fast loads don't flash it. While loading is pending
  // but the threshold hasn't elapsed, the body stays blank (the header still
  // shows); only a load that drags past SPINNER_DELAY_MS reveals the spinner.
  $effect(() => {
    if (!dataState.loading) {
      showSpinner = false;
      return;
    }
    const timer = setTimeout(() => {
      showSpinner = true;
    }, SPINNER_DELAY_MS);
    return () => clearTimeout(timer);
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
      <h1 class="text-lg font-bold text-gray-800">{$t.meetingFinder}</h1>
      {#if !dataState.loading && !dataState.error}
        <span class="text-xs text-gray-500">
          {groupCount}
          {groupCount === 1 ? $t.group : $t.groups}
          ·
          {filteredMeetings.length}
          {filteredMeetings.length === 1 ? $t.meeting : $t.meetings}
        </span>
      {/if}
    </div>
  {/if}

  {#if dataState.error}
    <!-- Error state -->
    <div class="flex flex-col items-center justify-center px-4 py-16 text-center">
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
      {#if config.geolocation}
        <form
          class="mt-6 flex w-full max-w-sm flex-col gap-2"
          onsubmit={(e) => {
            e.preventDefault();
            handleManualAddressSearch();
          }}
        >
          <label for="crumb-manual-address" class="text-xs font-medium text-gray-700">{$t.searchByAddress}</label>
          <div class="flex gap-2">
            <input
              id="crumb-manual-address"
              type="text"
              bind:value={manualAddress}
              placeholder={$t.searchLocation}
              class="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!manualAddress.trim() || dataState.loading}
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="search" class="h-4 w-4" strokeWidth={2} />
              <span class="sr-only">{$t.searchByAddress}</span>
            </button>
          </div>
        </form>
      {/if}
    </div>
  {:else if dataState.loading}
    {#if showSpinner}
      <Loading />
    {/if}
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
            <h1>{$t.meetings}</h1>
            <p>
              {filteredMeetings.length}
              {filteredMeetings.length === 1 ? $t.meeting : $t.meetings}
              — {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <MeetingList meetings={filteredMeetings} />
        </div>
      {/if}
    </div>
  {/if}
</div>
