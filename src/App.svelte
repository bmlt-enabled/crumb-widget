<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from '@bmlt-enabled/svelte-spa-router';
  import type { AppConfig, ProcessedMeeting } from '@/types';
  import { loadData, loadDataByCoordinates, dataState } from '@stores/data.svelte';
  import { uiState } from '@stores/ui.svelte';
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

    if (tryGeo && navigator.geolocation) {
      dataState.loading = true;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await loadDataByCoordinates(config.rootServerUrl, pos.coords.latitude, pos.coords.longitude, config.serviceBodyIds, config.geolocationRadius);
          if (!dataState.error) {
            uiState.geoActive = true;
            uiState.view = 'map';
          } else {
            uiState.view = 'list';
            await loadData(config.rootServerUrl, config.serviceBodyIds);
          }
        },
        async () => {
          // denied or unavailable — fall back to list + full load
          uiState.view = 'list';
          await loadData(config.rootServerUrl, config.serviceBodyIds);
        },
        { timeout: 10000 }
      );
    } else {
      await loadData(config.rootServerUrl, config.serviceBodyIds);
    }
  });

  const filteredMeetings = $derived.by((): ProcessedMeeting[] => {
    const { search, weekdays, venueTypes, timeOfDay, formatIds } = uiState.filters;
    let result = dataState.meetings;

    if (weekdays.length > 0) {
      result = result.filter((m) => weekdays.includes(m.weekday_tinyint));
    }
    if (venueTypes.length > 0) {
      result = result.filter((m) => (venueTypes.includes(1) && m.isInPerson) || (venueTypes.includes(2) && m.isVirtual));
    }
    if (timeOfDay.length > 0) {
      result = result.filter((m) => timeOfDay.includes(m.timeOfDay));
    }
    if (formatIds.length > 0) {
      result = result.filter((m) => m.resolvedFormats.some((f) => formatIds.includes(f.id)));
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.meeting_name.toLowerCase().includes(q) ||
          m.formattedAddress.toLowerCase().includes(q) ||
          m.location_municipality?.toLowerCase().includes(q) ||
          m.location_text?.toLowerCase().includes(q) ||
          m.comments?.toLowerCase().includes(q)
      );
    }

    return result;
  });

  // Derive selected meeting from the current hash route: #/{slug}-{id}
  const selectedMeeting = $derived.by((): ProcessedMeeting | undefined => {
    const match = router.location.match(/^\/(.+)-(\d+)$/);
    if (!match) return undefined;
    const id = match[2];
    return dataState.meetings.find((m) => m.id_bigint === id);
  });
</script>

<div class="bmlt-meeting-list flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white font-sans text-base">
  <!-- Header -->
  <div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
    <h1 class="text-lg font-bold text-gray-800">NA Meeting Finder</h1>
    {#if !dataState.loading && !dataState.error}
      <span class="text-xs text-gray-400">{dataState.meetings.length} meetings</span>
    {/if}
  </div>

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
    <div class="flex-1 overflow-hidden">
      <MeetingDetail meeting={selectedMeeting} />
    </div>
  {:else}
    <!-- Controls + list/map -->
    <Controls />
    <div class="relative flex-1 overflow-hidden">
      {#if uiState.view === 'map'}
        <MapView meetings={filteredMeetings} locationMarker={config.locationMarker} tiles={config.tiles} tilesDark={config.tilesDark} />
      {:else}
        <div class="h-full overflow-y-auto">
          <MeetingList meetings={filteredMeetings} />
        </div>
      {/if}
    </div>
  {/if}
</div>
