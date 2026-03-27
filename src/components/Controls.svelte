<script lang="ts">
  import { uiState, toggleArrayFilter, updateFilter, setView, resetFilters } from '@stores/ui.svelte';
  import { dataState, loadData, loadDataByCoordinates } from '@stores/data.svelte';
  import { config } from '@stores/config.svelte';
  import { WEEKDAYS } from '@utils/format';
  import { t } from '@stores/localization';

  const VENUE_TYPE_VALUES = [
    { value: 1, key: 'inPerson' as const },
    { value: 2, key: 'virtual' as const }
  ];

  const TIME_OF_DAY_VALUES = [
    { value: 'morning', key: 'morning' as const },
    { value: 'afternoon', key: 'afternoon' as const },
    { value: 'evening', key: 'evening' as const },
    { value: 'night', key: 'night' as const }
  ];

  const hasMapMeetings = $derived(dataState.meetings.some((m) => m.venue_type === 1 || m.venue_type === 3));

  const activeFilterCount = $derived(uiState.filters.weekdays.length + uiState.filters.venueTypes.length + uiState.filters.timeOfDay.length + uiState.filters.formatIds.length);

  let showFilters = $state(false);

  type GeoStatus = 'idle' | 'locating' | 'active' | 'error';
  let geoStatus = $state<GeoStatus>('idle');
  let geoError = $state('');
  let geoErrorTimer: ReturnType<typeof setTimeout> | null = null;

  async function handleNearMe() {
    if (uiState.geoActive) {
      uiState.geoActive = false;
      geoStatus = 'idle';
      await loadData(config.rootServerUrl, config.serviceBodyIds);
      return;
    }
    if (geoStatus === 'locating') return;

    geoStatus = 'locating';
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await loadDataByCoordinates(config.rootServerUrl, pos.coords.latitude, pos.coords.longitude, config.serviceBodyIds, config.geolocationRadius);
        if (dataState.error) {
          geoError = dataState.error;
          geoStatus = 'error';
          if (geoErrorTimer) clearTimeout(geoErrorTimer);
          geoErrorTimer = setTimeout(() => (geoStatus = 'idle'), 4000);
        } else {
          uiState.geoActive = true;
          geoStatus = 'active';
        }
      },
      (err) => {
        geoError = err.code === 1 ? $t.locationDenied : $t.locationError;
        geoStatus = 'error';
        if (geoErrorTimer) clearTimeout(geoErrorTimer);
        geoErrorTimer = setTimeout(() => (geoStatus = 'idle'), 4000);
      },
      { timeout: 10000 }
    );
  }
</script>

<div class="bmlt-controls border-b border-gray-200 bg-white px-4 py-3">
  <!-- Top row: search + view toggle -->
  <div class="flex items-center gap-3">
    <div class="relative flex-1">
      <svg class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        placeholder={$t.searchMeetings}
        value={uiState.filters.search}
        oninput={(e) => updateFilter('search', (e.target as HTMLInputElement).value)}
        class="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <!-- Filter toggle -->
    <button
      onclick={() => (showFilters = !showFilters)}
      class="relative flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors {showFilters
        ? 'bmlt-filter-toggle-active border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 4a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm3 4a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z"
        />
      </svg>
      {$t.filters}
      {#if activeFilterCount > 0}
        <span class="bmlt-btn-primary absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-xs text-white">{activeFilterCount}</span>
      {/if}
    </button>

    <!-- Near Me button -->
    {#if config.geolocation}
      <div class="relative">
        <button
          onclick={handleNearMe}
          disabled={geoStatus === 'locating'}
          class="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors {uiState.geoActive
            ? 'bmlt-geo-active border-blue-500 bg-blue-600 text-white'
            : geoStatus === 'error'
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60'}"
        >
          {#if geoStatus === 'locating'}
            <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span class="hidden sm:inline">{$t.locating}</span>
          {:else if geoStatus === 'error'}
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span class="hidden sm:inline">{geoError}</span>
          {:else}
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="hidden sm:inline">{$t.nearMe}</span>
          {/if}
        </button>
        {#if uiState.geoActive}
          <button
            onclick={handleNearMe}
            class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-800 text-white hover:bg-blue-900"
            aria-label="Clear location"
          >
            <svg class="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {/if}
      </div>
    {/if}

    <!-- View toggle -->
    {#if hasMapMeetings || uiState.view === 'map' || uiState.geoActive}
      <div class="flex rounded-lg border border-gray-300 bg-white">
        <button
          onclick={() => setView('list')}
          class="flex items-center gap-1.5 rounded-l-lg px-3 py-2 text-sm font-medium transition-colors {uiState.view !== 'detail' && uiState.view === 'list'
            ? 'bmlt-btn-primary bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-50'}"
          title={$t.listView}
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span class="hidden sm:inline">{$t.list}</span>
        </button>
        <button
          onclick={() => setView('map')}
          class="flex items-center gap-1.5 rounded-r-lg px-3 py-2 text-sm font-medium transition-colors {uiState.view === 'map'
            ? 'bmlt-btn-primary bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-50'}"
          title={$t.mapView}
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span class="hidden sm:inline">{$t.map}</span>
        </button>
      </div>
    {/if}
  </div>

  <!-- Filter panel -->
  {#if showFilters}
    <div class="mt-3 flex flex-wrap gap-4 border-t border-gray-100 pt-3">
      <!-- Weekday filter -->
      <div class="min-w-[160px]">
        <p class="mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">{$t.day}</p>
        <div class="flex flex-wrap gap-1">
          {#each WEEKDAYS.slice(1) as day, i (i)}
            <button
              onclick={() => toggleArrayFilter('weekdays', i + 1)}
              class="rounded px-2 py-0.5 text-xs font-medium transition-colors {uiState.filters.weekdays.includes(i + 1)
                ? 'bmlt-btn-primary bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">{day.slice(0, 3)}</button
            >
          {/each}
        </div>
      </div>

      <!-- Venue type filter -->
      <div class="min-w-[140px]">
        <p class="mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">{$t.venueType}</p>
        <div class="flex flex-wrap gap-1">
          {#each VENUE_TYPE_VALUES as vt (vt.value)}
            <button
              onclick={() => toggleArrayFilter('venueTypes', vt.value)}
              class="rounded px-2 py-0.5 text-xs font-medium transition-colors {uiState.filters.venueTypes.includes(vt.value)
                ? 'bmlt-btn-primary bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">{$t[vt.key]}</button
            >
          {/each}
        </div>
      </div>

      <!-- Time of day filter -->
      <div class="min-w-[160px]">
        <p class="mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">{$t.timeOfDay}</p>
        <div class="flex flex-wrap gap-1">
          {#each TIME_OF_DAY_VALUES as tod (tod.value)}
            <button
              onclick={() => toggleArrayFilter('timeOfDay', tod.value)}
              class="rounded px-2 py-0.5 text-xs font-medium transition-colors {uiState.filters.timeOfDay.includes(tod.value)
                ? 'bmlt-btn-primary bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}">{$t[tod.key]}</button
            >
          {/each}
        </div>
      </div>

      {#if activeFilterCount > 0}
        <div class="flex items-end">
          <button onclick={resetFilters} class="text-xs text-red-600 underline hover:text-red-800">{$t.clearAllFilters}</button>
        </div>
      {/if}
    </div>
  {/if}
</div>
