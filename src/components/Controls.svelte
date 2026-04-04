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
  const availableFormats = $derived([...new Map(dataState.meetings.flatMap((m) => m.resolvedFormats).map((f) => [f.id, f])).values()].sort((a, b) => a.name_string.localeCompare(b.name_string)));
  const showViewToggle = $derived(hasMapMeetings || uiState.view === 'map' || uiState.geoActive);

  let showDayDropdown = $state(false);
  let showTimeDropdown = $state(false);
  let showTypeDropdown = $state(false);
  let dayDropdownEl = $state<HTMLDivElement | undefined>();
  let timeDropdownEl = $state<HTMLDivElement | undefined>();
  let typeDropdownEl = $state<HTMLDivElement | undefined>();

  function handleWindowClick(e: MouseEvent) {
    if (dayDropdownEl && !dayDropdownEl.contains(e.target as Node)) showDayDropdown = false;
    if (timeDropdownEl && !timeDropdownEl.contains(e.target as Node)) showTimeDropdown = false;
    if (typeDropdownEl && !typeDropdownEl.contains(e.target as Node)) showTypeDropdown = false;
  }

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
        await loadDataByCoordinates(config.rootServerUrl, pos.coords.latitude, pos.coords.longitude, config.geolocationRadius);
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

<svelte:window onclick={handleWindowClick} />

<div class="bmlt-controls relative z-[1001] border-b border-gray-200 bg-white px-3 py-3">
  <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-nowrap sm:items-center">
    <!-- Search -->
    <div class="relative {config.geolocation ? '' : 'col-span-2'} sm:max-w-48 sm:min-w-0 sm:flex-1">
      <svg class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        placeholder={$t.searchMeetings}
        value={uiState.filters.search}
        oninput={(e) => updateFilter('search', (e.target as HTMLInputElement).value)}
        class="w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-3 pl-9 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <!-- Anywhere / Near Me -->
    {#if config.geolocation}
      <button
        onclick={handleNearMe}
        disabled={geoStatus === 'locating' || (uiState.geoActive && config.serviceBodyIds.length === 0)}
        class="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors sm:w-auto {uiState.geoActive
          ? 'bmlt-filter-toggle-active border-blue-500 bg-blue-50 text-blue-700'
          : geoStatus === 'error'
            ? 'border-red-300 bg-red-50 text-red-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60'}"
      >
        <span class="flex items-center gap-1.5 truncate">
          {#if geoStatus === 'locating'}
            <svg class="h-4 w-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {$t.locating}
          {:else if geoStatus === 'error'}
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span class="truncate">{geoError}</span>
          {:else}
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {uiState.geoActive ? $t.nearMe : $t.anywhere}
          {/if}
        </span>
        {#if uiState.geoActive && config.serviceBodyIds.length > 0}
          <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else if geoStatus === 'idle' && config.serviceBodyIds.length > 0}
          <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        {/if}
      </button>
    {/if}

    <!-- Day dropdown -->
    <div class="relative sm:flex-none" bind:this={dayDropdownEl}>
      <button
        onclick={(e) => {
          e.stopPropagation();
          showDayDropdown = !showDayDropdown;
          showTimeDropdown = false;
          showTypeDropdown = false;
        }}
        class="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors sm:w-auto {uiState.filters.weekdays.length > 0
          ? 'bmlt-filter-toggle-active border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
      >
        <span>
          {#if uiState.filters.weekdays.length === 0}
            {$t.anyDay}
          {:else if uiState.filters.weekdays.length === 1}
            {WEEKDAYS[uiState.filters.weekdays[0]]}
          {:else}
            {uiState.filters.weekdays.length} {$t.day}s
          {/if}
        </span>
        <svg class="h-3.5 w-3.5 shrink-0 transition-transform {showDayDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {#if showDayDropdown}
        <div class="absolute top-full left-0 z-[1001] mt-1 w-full min-w-[9rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {#each WEEKDAYS.slice(1) as day, i (i)}
            <button
              onclick={() => toggleArrayFilter('weekdays', i + 1)}
              class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 {uiState.filters.weekdays.includes(i + 1) ? 'font-semibold text-blue-700' : 'text-gray-700'}"
            >
              <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border {uiState.filters.weekdays.includes(i + 1) ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}">
                {#if uiState.filters.weekdays.includes(i + 1)}
                  <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                {/if}
              </span>
              {day}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Time of day dropdown -->
    <div class="relative sm:flex-none" bind:this={timeDropdownEl}>
      <button
        onclick={(e) => {
          e.stopPropagation();
          showTimeDropdown = !showTimeDropdown;
          showDayDropdown = false;
          showTypeDropdown = false;
        }}
        class="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors {uiState.filters.timeOfDay.length > 0
          ? 'bmlt-filter-toggle-active border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
      >
        <span>
          {#if uiState.filters.timeOfDay.length === 0}
            {$t.anyTime}
          {:else if uiState.filters.timeOfDay.length === 1}
            {$t[TIME_OF_DAY_VALUES.find((v) => v.value === uiState.filters.timeOfDay[0])!.key]}
          {:else}
            {uiState.filters.timeOfDay.length} {$t.timeOfDay}
          {/if}
        </span>
        <svg class="h-3.5 w-3.5 shrink-0 transition-transform {showTimeDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {#if showTimeDropdown}
        <div class="absolute top-full left-0 z-[1001] mt-1 w-full min-w-[9rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {#each TIME_OF_DAY_VALUES as tod (tod.value)}
            <button
              onclick={() => toggleArrayFilter('timeOfDay', tod.value)}
              class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 {uiState.filters.timeOfDay.includes(tod.value) ? 'font-semibold text-blue-700' : 'text-gray-700'}"
            >
              <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border {uiState.filters.timeOfDay.includes(tod.value) ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}">
                {#if uiState.filters.timeOfDay.includes(tod.value)}
                  <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                {/if}
              </span>
              {$t[tod.key]}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Type dropdown (venue type + format) -->
    <div class="relative {showViewToggle ? '' : 'col-span-2'} sm:flex-none" bind:this={typeDropdownEl}>
      <button
        onclick={(e) => {
          e.stopPropagation();
          showTypeDropdown = !showTypeDropdown;
          showDayDropdown = false;
          showTimeDropdown = false;
        }}
        class="flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors {uiState.filters.venueTypes.length > 0 ||
        uiState.filters.formatIds.length > 0
          ? 'bmlt-filter-toggle-active border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
      >
        <span>
          {#if uiState.filters.venueTypes.length === 0 && uiState.filters.formatIds.length === 0}
            {$t.anyType}
          {:else if uiState.filters.venueTypes.length === 1 && uiState.filters.formatIds.length === 0}
            {$t[VENUE_TYPE_VALUES.find((v) => uiState.filters.venueTypes.includes(v.value))!.key]}
          {:else if uiState.filters.venueTypes.length === 0 && uiState.filters.formatIds.length === 1}
            {availableFormats.find((f) => f.id === uiState.filters.formatIds[0])?.name_string ?? '1 selected'}
          {:else}
            {uiState.filters.venueTypes.length + uiState.filters.formatIds.length} {$t.filters}
          {/if}
        </span>
        <svg class="h-3.5 w-3.5 shrink-0 transition-transform {showTypeDropdown ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {#if showTypeDropdown}
        <div class="absolute top-full left-0 z-[1001] mt-1 w-full min-w-[10rem] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg" style="max-height:min(18rem, 60vh)">
          {#each VENUE_TYPE_VALUES as vt (vt.value)}
            <button
              onclick={() => toggleArrayFilter('venueTypes', vt.value)}
              class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 {uiState.filters.venueTypes.includes(vt.value) ? 'font-semibold text-blue-700' : 'text-gray-700'}"
            >
              <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border {uiState.filters.venueTypes.includes(vt.value) ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}">
                {#if uiState.filters.venueTypes.includes(vt.value)}
                  <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                {/if}
              </span>
              {$t[vt.key]}
            </button>
          {/each}
          {#if availableFormats.length > 0}
            <div class="my-1 border-t border-gray-100"></div>
            {#each availableFormats as fmt (fmt.id)}
              <button
                onclick={() => toggleArrayFilter('formatIds', fmt.id)}
                class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 {uiState.filters.formatIds.includes(fmt.id) ? 'font-semibold text-blue-700' : 'text-gray-700'}"
                title={fmt.description_string}
              >
                <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border {uiState.filters.formatIds.includes(fmt.id) ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}">
                  {#if uiState.filters.formatIds.includes(fmt.id)}
                    <svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  {/if}
                </span>
                {fmt.name_string}
              </button>
            {/each}
          {/if}
        </div>
      {/if}
    </div>

    <!-- Clear all filters — desktop only, inline so no layout shift -->
    {#if activeFilterCount > 0 || uiState.filters.search}
      <button onclick={resetFilters} class="hidden text-xs whitespace-nowrap text-red-600 underline hover:text-red-800 sm:ml-auto sm:block">{$t.clearAllFilters}</button>
    {/if}

    <!-- List / Map view toggle -->
    {#if showViewToggle}
      <div class="flex rounded-lg border border-gray-300 bg-white sm:ml-auto sm:flex-none">
        <button
          onclick={() => setView('list')}
          class="flex flex-1 items-center justify-center gap-1.5 rounded-l-lg px-3 py-2.5 text-sm font-medium transition-colors {uiState.view === 'list'
            ? 'bmlt-btn-primary bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-50'}"
          title={$t.listView}
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          {$t.list}
        </button>
        <button
          onclick={() => setView('map')}
          class="flex flex-1 items-center justify-center gap-1.5 rounded-r-lg px-3 py-2.5 text-sm font-medium transition-colors {uiState.view === 'map'
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
          {$t.map}
        </button>
      </div>
    {/if}
  </div>
</div>
