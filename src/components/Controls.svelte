<script lang="ts">
  import { onDestroy } from 'svelte';
  import { uiState, toggleArrayFilter, updateFilter, setView, resetFilters } from '@stores/ui.svelte';
  import { dataState, loadData, loadDataByCoordinates } from '@stores/data.svelte';
  import { config } from '@stores/config.svelte';
  import { VENUE_TYPE } from '@/types';
  import { getGeoErrorMessage } from '@utils/format';
  import { t } from '@stores/localization';
  import FilterDropdown from '@components/FilterDropdown.svelte';

  const GEOLOCATION_TIMEOUT_MS = 10000;
  const GEO_ERROR_DISPLAY_MS = 4000;

  const VENUE_TYPE_VALUES = [
    { value: VENUE_TYPE.IN_PERSON, key: 'inPerson' as const },
    { value: VENUE_TYPE.VIRTUAL, key: 'virtual' as const }
  ];

  const TIME_OF_DAY_VALUES = [
    { value: 'morning', key: 'morning' as const },
    { value: 'afternoon', key: 'afternoon' as const },
    { value: 'evening', key: 'evening' as const },
    { value: 'night', key: 'night' as const }
  ];

  const hasMapMeetings = $derived(dataState.meetings.some((m) => m.venue_type === VENUE_TYPE.IN_PERSON || m.venue_type === VENUE_TYPE.HYBRID));
  const activeFilterCount = $derived(
    uiState.filters.weekdays.length + uiState.filters.venueTypes.length + uiState.filters.timeOfDay.length + uiState.filters.formatIds.length + uiState.filters.serviceBodyNames.length
  );
  const availableFormats = $derived.by(() => {
    const uniqueById = new Map(dataState.meetings.flatMap((m) => m.resolvedFormats).map((f) => [f.id, f]));
    return [...uniqueById.values()].sort((a, b) => a.name_string.localeCompare(b.name_string));
  });
  const availableServiceBodies = $derived.by(() => {
    const names = new Set(dataState.meetings.map((m) => m.service_body_name).filter((n): n is string => !!n));
    return [...names].sort((a, b) => a.localeCompare(b));
  });
  const showServiceBodyFilter = $derived(config.columns.includes('service_body') && availableServiceBodies.length > 1);
  const showViewToggle = $derived(config.defaultView !== 'both' && (hasMapMeetings || uiState.view === 'map' || uiState.geoActive));

  let showDayDropdown = $state(false);
  let showTimeDropdown = $state(false);
  let showServiceBodyDropdown = $state(false);
  let showTypeDropdown = $state(false);
  let typeDropdownEl = $state<HTMLDivElement | undefined>();

  function handleWindowClick(e: MouseEvent) {
    if (typeDropdownEl && !typeDropdownEl.contains(e.target as Node)) showTypeDropdown = false;
  }

  type GeoStatus = 'idle' | 'locating' | 'active' | 'error';
  let geoStatus = $state<GeoStatus>('idle');
  let geoError = $state('');
  let geoErrorTimer: ReturnType<typeof setTimeout> | null = null;

  onDestroy(() => {
    if (geoErrorTimer) clearTimeout(geoErrorTimer);
  });

  async function handleNearMe() {
    if (uiState.geoActive) {
      uiState.geoActive = false;
      geoStatus = 'idle';
      await loadData(config.serverUrl, config.serviceBodyIds);
      return;
    }
    if (geoStatus === 'locating') return;

    geoStatus = 'locating';
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await loadDataByCoordinates(config.serverUrl, pos.coords.latitude, pos.coords.longitude, config.geolocationRadius);
        if (dataState.error) {
          geoError = dataState.error;
          geoStatus = 'error';
          if (geoErrorTimer) clearTimeout(geoErrorTimer);
          geoErrorTimer = setTimeout(() => (geoStatus = 'idle'), GEO_ERROR_DISPLAY_MS);
        } else {
          uiState.geoActive = true;
          geoStatus = 'active';
        }
      },
      (err) => {
        geoError = getGeoErrorMessage(err.code, $t).title;
        geoStatus = 'error';
        if (geoErrorTimer) clearTimeout(geoErrorTimer);
        geoErrorTimer = setTimeout(() => (geoStatus = 'idle'), GEO_ERROR_DISPLAY_MS);
      },
      { timeout: GEOLOCATION_TIMEOUT_MS }
    );
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="bmlt-controls relative border-b border-gray-200 bg-white px-3 py-3">
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
    <FilterDropdown
      buttonLabel={uiState.filters.weekdays.length === 0
        ? $t.anyDay
        : uiState.filters.weekdays.length === 1
          ? ($t.weekdays[uiState.filters.weekdays[0]! - 1] ?? '')
          : `${uiState.filters.weekdays.length} ${$t.day}s`}
      isActive={uiState.filters.weekdays.length > 0}
      selected={uiState.filters.weekdays}
      options={$t.weekdays.map((day, i) => ({ value: i + 1, label: day }))}
      bind:isOpen={showDayDropdown}
      onToggle={(v) => toggleArrayFilter('weekdays', v)}
      onOpen={() => {
        showTimeDropdown = false;
        showTypeDropdown = false;
        showServiceBodyDropdown = false;
      }}
    />

    <!-- Time of day dropdown -->
    <FilterDropdown
      buttonLabel={uiState.filters.timeOfDay.length === 0
        ? $t.anyTime
        : uiState.filters.timeOfDay.length === 1
          ? $t[TIME_OF_DAY_VALUES.find((v) => v.value === uiState.filters.timeOfDay[0])?.key ?? 'anyTime']
          : `${uiState.filters.timeOfDay.length} ${$t.timeOfDay}`}
      isActive={uiState.filters.timeOfDay.length > 0}
      selected={uiState.filters.timeOfDay}
      options={TIME_OF_DAY_VALUES.map((tod) => ({ value: tod.value, label: $t[tod.key] }))}
      bind:isOpen={showTimeDropdown}
      onToggle={(v) => toggleArrayFilter('timeOfDay', v)}
      onOpen={() => {
        showDayDropdown = false;
        showTypeDropdown = false;
        showServiceBodyDropdown = false;
      }}
    />

    <!-- Type dropdown (venue type + format) -->
    <div class="relative sm:max-w-[13rem] sm:min-w-[8rem] sm:flex-1 {showViewToggle ? '' : 'col-span-2'}" bind:this={typeDropdownEl}>
      <button
        onclick={(e) => {
          e.stopPropagation();
          showTypeDropdown = !showTypeDropdown;
          showDayDropdown = false;
          showTimeDropdown = false;
          showServiceBodyDropdown = false;
        }}
        class="flex w-full items-center justify-between rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors {uiState.filters.venueTypes.length > 0 ||
        uiState.filters.formatIds.length > 0
          ? 'bmlt-filter-toggle-active border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
      >
        <span>
          {#if uiState.filters.venueTypes.length === 0 && uiState.filters.formatIds.length === 0}
            {$t.anyType}
          {:else if uiState.filters.venueTypes.length === 1 && uiState.filters.formatIds.length === 0}
            {$t[VENUE_TYPE_VALUES.find((v) => uiState.filters.venueTypes.includes(v.value))?.key ?? 'anyType']}
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
              class="flex w-full items-center gap-2.5 border-0 px-3 py-2 text-left text-sm hover:bg-gray-50 {uiState.filters.venueTypes.includes(vt.value)
                ? 'font-semibold text-blue-700'
                : 'text-gray-700'}"
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
                class="flex w-full items-center gap-2.5 border-0 px-3 py-2 text-left text-sm hover:bg-gray-50 {uiState.filters.formatIds.includes(fmt.id)
                  ? 'font-semibold text-blue-700'
                  : 'text-gray-700'}"
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

    <!-- Service body dropdown -->
    {#if showServiceBodyFilter}
      <FilterDropdown
        buttonLabel={uiState.filters.serviceBodyNames.length === 0
          ? $t.anyServiceBody
          : uiState.filters.serviceBodyNames.length === 1
            ? (uiState.filters.serviceBodyNames[0] ?? '')
            : `${uiState.filters.serviceBodyNames.length} ${$t.serviceBody}`}
        isActive={uiState.filters.serviceBodyNames.length > 0}
        selected={uiState.filters.serviceBodyNames}
        options={availableServiceBodies.map((name) => ({ value: name, label: name }))}
        bind:isOpen={showServiceBodyDropdown}
        onToggle={(v) => toggleArrayFilter('serviceBodyNames', v)}
        onOpen={() => {
          showDayDropdown = false;
          showTimeDropdown = false;
          showTypeDropdown = false;
        }}
        containerClass={!showViewToggle ? 'col-span-2' : ''}
      />
    {/if}

    <!-- Clear all filters — desktop only, inline so no layout shift -->
    {#if activeFilterCount > 0 || uiState.filters.search}
      <button
        onclick={resetFilters}
        class="hidden items-center gap-1 rounded-lg border-2 border-red-300 bg-red-50 px-3 py-2.5 text-sm font-semibold whitespace-nowrap text-red-600 shadow-sm transition-colors hover:border-red-400 hover:bg-red-100 hover:shadow sm:ml-auto sm:flex"
        >{$t.clearAllFilters}</button
      >
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
