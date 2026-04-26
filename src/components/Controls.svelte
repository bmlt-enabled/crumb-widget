<script lang="ts">
  import { onDestroy } from 'svelte';
  import { uiState, toggleArrayFilter, updateFilter, setView, resetFilters } from '@stores/ui.svelte';
  import { dataState, loadData } from '@stores/data.svelte';
  import { config } from '@stores/config.svelte';
  import { VENUE_TYPE } from '@/types';
  import { getGeoErrorMessage, haversineDistanceMiles } from '@utils/format';
  import { GEOLOCATION_TIMEOUT_MS, kmToMiles } from '@utils/constants';
  import { t } from '@stores/localization';
  import FilterDropdown from '@components/FilterDropdown.svelte';
  import Icon from '@components/Icon.svelte';

  const GEO_ERROR_DISPLAY_MS = 4000;
  // Build the dropdown list from config.distanceOptions, capped at config.geolocationRadius.
  // If geolocationRadius isn't already in the list it is appended so the maximum is always reachable.
  // When a user location is known, options with zero matching meetings are hidden.
  const distanceOptions = $derived.by(() => {
    const max = config.geolocationRadius;
    const opts = config.distanceOptions.filter((d) => d < max);
    opts.push(max);

    if (!uiState.userLocation) return opts;

    const loc = uiState.userLocation;
    return opts.filter((dist) => {
      const radiusMiles = config.distanceUnit === 'km' ? kmToMiles(dist) : dist;
      return dataState.meetings.some((m) => {
        const lat = Number(m.latitude);
        const lng = Number(m.longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
        return haversineDistanceMiles(loc.lat, loc.lng, lat, lng) <= radiusMiles;
      });
    });
  });

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
  const activeChips = $derived.by(() => {
    const chips: { key: string; label: string; remove: () => void }[] = [];

    if (uiState.filters.search) {
      chips.push({ key: 'search', label: `"${uiState.filters.search}"`, remove: () => updateFilter('search', '') });
    }
    for (const v of uiState.filters.venueTypes) {
      const entry = VENUE_TYPE_VALUES.find((vt) => vt.value === v);
      if (entry) chips.push({ key: `venue-${v}`, label: $t[entry.key], remove: () => toggleArrayFilter('venueTypes', v) });
    }
    for (const v of uiState.filters.weekdays) {
      const label = $t.weekdays[(v as number) - 1];
      if (label) chips.push({ key: `day-${v}`, label, remove: () => toggleArrayFilter('weekdays', v) });
    }
    for (const v of uiState.filters.timeOfDay) {
      const entry = TIME_OF_DAY_VALUES.find((tod) => tod.value === v);
      if (entry) chips.push({ key: `time-${v}`, label: $t[entry.key], remove: () => toggleArrayFilter('timeOfDay', v) });
    }
    for (const id of uiState.filters.formatIds) {
      const fmt = availableFormats.find((f) => f.id === id);
      if (fmt) chips.push({ key: `fmt-${id}`, label: fmt.name_string, remove: () => toggleArrayFilter('formatIds', id) });
    }
    for (const name of uiState.filters.serviceBodyNames) {
      chips.push({ key: `sb-${name}`, label: name, remove: () => toggleArrayFilter('serviceBodyNames', name) });
    }

    return chips;
  });
  const availableFormats = $derived.by(() => {
    const uniqueById = new Map(dataState.meetings.flatMap((m) => m.resolvedFormats).map((f) => [f.id, f]));
    return [...uniqueById.values()].sort((a, b) => a.name_string.localeCompare(b.name_string));
  });

  const FORMAT_TYPE_GROUPS = [
    { type: 'OPEN_OR_CLOSED', labelKey: 'formatTypeCode_OPEN_OR_CLOSED' as const },
    { type: 'MEETING_FORMAT', labelKey: 'formatTypeCode_MEETING_FORMAT' as const },
    { type: 'COMMON_NEEDS_OR_RESTRICTION', labelKey: 'formatTypeCode_COMMON_NEEDS_OR_RESTRICTION' as const },
    { type: 'LOCATION', labelKey: 'formatTypeCode_LOCATION' as const },
    { type: 'LANGUAGE', labelKey: 'formatTypeCode_LANGUAGE' as const },
    { type: 'ALERT', labelKey: 'formatTypeCode_ALERT' as const }
  ];

  // The legacy BMLT API returns short codes (FC1, FC2, …) while the v3 REST API
  // uses descriptive enums (MEETING_FORMAT, LOCATION, …). Normalize both to the
  // canonical group type strings used by FORMAT_TYPE_GROUPS.
  const LEGACY_TYPE_MAP: Record<string, string> = {
    FC1: 'MEETING_FORMAT',
    FC2: 'LOCATION',
    FC3: 'COMMON_NEEDS_OR_RESTRICTION',
    O: 'OPEN_OR_CLOSED',
    LANG: 'LANGUAGE'
  };

  const groupedFormatSections = $derived.by(() => {
    if (availableFormats.length === 0) return [];

    const byType = availableFormats.reduce(
      (acc, fmt) => {
        const raw = fmt.format_type_enum || '';
        const type = (LEGACY_TYPE_MAP[raw] ?? raw) || '_none';
        (acc[type] ??= []).push(fmt);
        return acc;
      },
      {} as Record<string, typeof availableFormats>
    );

    const knownTypes = new Set(FORMAT_TYPE_GROUPS.map((g) => g.type));
    const sections: { label: string; formats: typeof availableFormats }[] = [];

    for (const group of FORMAT_TYPE_GROUPS) {
      const formats = byType[group.type];
      if (formats?.length) {
        sections.push({
          label: $t[group.labelKey],
          formats: [...formats].sort((a, b) => a.name_string.localeCompare(b.name_string))
        });
      }
    }

    const noneFormats = Object.entries(byType)
      .filter(([type]) => !knownTypes.has(type))
      .flatMap(([, fmts]) => fmts)
      .sort((a, b) => a.name_string.localeCompare(b.name_string));

    if (noneFormats.length) {
      sections.push({ label: $t.formatTypeCode_NONE, formats: noneFormats });
    }

    return sections;
  });

  const availableServiceBodies = $derived.by(() => {
    const names = new Set(dataState.meetings.map((m) => m.service_body_name).filter((n): n is string => !!n));
    return [...names].sort((a, b) => a.localeCompare(b));
  });
  const showServiceBodyFilter = $derived(config.columns.includes('service_body') && availableServiceBodies.length > 1);
  const showViewToggle = $derived(config.view !== 'both' && (hasMapMeetings || uiState.view === 'map' || uiState.geoActive));

  let showDayDropdown = $state(false);
  let showTimeDropdown = $state(false);
  let showServiceBodyDropdown = $state(false);
  let showTypeDropdown = $state(false);
  let showGeoDropdown = $state(false);
  let typeDropdownEl = $state<HTMLDivElement | undefined>();
  let geoDropdownEl = $state<HTMLDivElement | undefined>();

  function handleWindowClick(e: MouseEvent) {
    if (typeDropdownEl && !typeDropdownEl.contains(e.target as Node)) showTypeDropdown = false;
    if (geoDropdownEl && !geoDropdownEl.contains(e.target as Node)) showGeoDropdown = false;
  }

  type GeoStatus = 'idle' | 'locating' | 'active' | 'error';
  let geoStatus = $state<GeoStatus>('idle');
  let geoError = $state('');
  let geoErrorTimer: ReturnType<typeof setTimeout> | null = null;
  let activeRadius = $state(0);

  onDestroy(() => {
    if (geoErrorTimer) clearTimeout(geoErrorTimer);
  });

  async function clearGeo() {
    uiState.geoActive = false;
    uiState.userLocation = undefined;
    uiState.geoRadius = 0;
    activeRadius = 0;
    geoStatus = 'idle';
    await loadData(config.serverUrl, config.serviceBodyIds);
  }

  function applyGeoRadius(radius: number) {
    const radiusMiles = config.distanceUnit === 'km' ? kmToMiles(radius) : radius;
    uiState.geoRadius = radiusMiles;
    uiState.geoActive = true;
    activeRadius = radius;
    geoStatus = 'active';
  }

  function handleNearMe(radius: number) {
    if (geoStatus === 'locating') return;
    showGeoDropdown = false;

    // Already have a location — just update the radius, no new geolocation needed
    if (uiState.userLocation) {
      applyGeoRadius(radius);
      return;
    }

    geoStatus = 'locating';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        uiState.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        applyGeoRadius(radius);
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
  <div class="grid grid-cols-2 gap-2 md:flex md:flex-nowrap md:items-center">
    <!-- Search -->
    <div class="relative col-span-2 md:hidden lg:block lg:max-w-48 lg:min-w-0 lg:flex-1">
      <Icon name="search" class="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        placeholder={$t.searchMeetings}
        value={uiState.filters.search}
        oninput={(e) => updateFilter('search', (e.target as HTMLInputElement).value)}
        class="w-full rounded-lg border border-gray-300 bg-white py-2.5 ps-9 pe-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      />
    </div>

    <!-- Anywhere / Near Me (distance dropdown) -->
    {#if config.geolocation}
      <div class="relative col-span-2 md:col-span-1" bind:this={geoDropdownEl}>
        <div
          class="flex w-full overflow-hidden rounded-lg border text-sm font-medium whitespace-nowrap transition-colors {uiState.geoActive
            ? 'bmlt-filter-toggle-active border-blue-500 bg-blue-50 text-blue-700'
            : geoStatus === 'error'
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-gray-300 bg-white text-gray-700'}"
        >
          <!-- Main button: opens dropdown -->
          <button
            onclick={(e) => {
              e.stopPropagation();
              showGeoDropdown = !showGeoDropdown;
              showDayDropdown = false;
              showTimeDropdown = false;
              showTypeDropdown = false;
              showServiceBodyDropdown = false;
            }}
            disabled={geoStatus === 'locating'}
            class="flex flex-1 items-center gap-1.5 px-3 py-2.5 disabled:cursor-wait disabled:opacity-60 {uiState.geoActive ? 'hover:bg-blue-100' : geoStatus === 'error' ? '' : 'hover:bg-gray-50'}"
          >
            {#if geoStatus === 'locating'}
              <svg class="h-4 w-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {$t.locating}
            {:else if geoStatus === 'error'}
              <Icon name="alert" class="h-4 w-4 shrink-0" />
              <span class="truncate">{geoError}</span>
            {:else}
              <Icon name="map-pin" class="h-4 w-4 shrink-0" />
              {#if uiState.geoActive}
                {$t.nearMe}{activeRadius ? ` · ${activeRadius} ${$t[config.distanceUnit]}` : ''}
              {:else}
                {$t.anywhere}
              {/if}
              <Icon name="chevron-down" class="ms-auto h-3.5 w-3.5 shrink-0 transition-transform {showGeoDropdown ? 'rotate-180' : ''}" />
            {/if}
          </button>
          <!-- X to clear (only when active and can deactivate) -->
          {#if uiState.geoActive && config.serviceBodyIds.length > 0}
            <button
              onclick={(e) => {
                e.stopPropagation();
                clearGeo();
              }}
              class="flex items-center border-s border-blue-300 px-2 hover:bg-blue-100"
              aria-label="Clear location filter"
            >
              <Icon name="x" class="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>
          {/if}
        </div>

        <!-- Distance dropdown -->
        {#if showGeoDropdown}
          <div class="absolute top-full left-0 z-[1001] mt-1 w-full min-w-[9rem] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {#if config.serviceBodyIds.length > 0}
              <button
                onclick={() => {
                  showGeoDropdown = false;
                  clearGeo();
                }}
                class="flex w-full items-center gap-2.5 border-0 px-3 py-2 text-start text-sm hover:bg-gray-50 {!uiState.geoActive ? 'font-semibold text-blue-700' : 'text-gray-700'}"
              >
                <span class="flex h-4 w-4 shrink-0 items-center justify-center">
                  {#if !uiState.geoActive}
                    <Icon name="check" class="h-3.5 w-3.5 text-blue-600" strokeWidth={3} />
                  {/if}
                </span>
                {$t.anywhere}
              </button>
              <div class="my-1 border-t border-gray-100"></div>
            {/if}
            <div class="px-3 pt-2 pb-0.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">{$t.nearMe}</div>
            {#each distanceOptions as dist (dist)}
              <button
                onclick={() => handleNearMe(dist)}
                class="flex w-full items-center gap-2.5 border-0 px-3 py-2 text-start text-sm hover:bg-gray-50 {uiState.geoActive && activeRadius === dist
                  ? 'font-semibold text-blue-700'
                  : 'text-gray-700'}"
              >
                <span class="flex h-4 w-4 shrink-0 items-center justify-center">
                  {#if uiState.geoActive && activeRadius === dist}
                    <Icon name="check" class="h-3.5 w-3.5 text-blue-600" strokeWidth={3} />
                  {/if}
                </span>
                {dist}
                {$t[config.distanceUnit]}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Day dropdown -->
    <FilterDropdown
      buttonLabel={uiState.filters.weekdays.length === 0
        ? $t.anyDay
        : uiState.filters.weekdays.length === 1
          ? ($t.weekdays[uiState.filters.weekdays[0]! - 1] ?? '')
          : `${uiState.filters.weekdays.length} ${$t.selected}`}
      isActive={uiState.filters.weekdays.length > 0}
      selected={uiState.filters.weekdays}
      options={$t.weekdays.map((day, i) => ({ value: i + 1, label: day }))}
      bind:isOpen={showDayDropdown}
      onToggle={(v) => toggleArrayFilter('weekdays', v)}
      onOpen={() => {
        showTimeDropdown = false;
        showTypeDropdown = false;
        showServiceBodyDropdown = false;
        showGeoDropdown = false;
      }}
    />

    <!-- Time of day dropdown -->
    <FilterDropdown
      buttonLabel={uiState.filters.timeOfDay.length === 0
        ? $t.anyTime
        : uiState.filters.timeOfDay.length === 1
          ? $t[TIME_OF_DAY_VALUES.find((v) => v.value === uiState.filters.timeOfDay[0])?.key ?? 'anyTime']
          : `${uiState.filters.timeOfDay.length} ${$t.selected}`}
      isActive={uiState.filters.timeOfDay.length > 0}
      selected={uiState.filters.timeOfDay}
      options={TIME_OF_DAY_VALUES.map((tod) => ({ value: tod.value, label: $t[tod.key] }))}
      bind:isOpen={showTimeDropdown}
      onToggle={(v) => toggleArrayFilter('timeOfDay', v)}
      onOpen={() => {
        showDayDropdown = false;
        showTypeDropdown = false;
        showServiceBodyDropdown = false;
        showGeoDropdown = false;
      }}
    />

    <!-- Type dropdown (venue type + format) -->
    <div class="relative md:max-w-[13rem] md:min-w-[8rem] md:flex-1 {showViewToggle ? '' : 'col-span-2'}" bind:this={typeDropdownEl}>
      <button
        onclick={(e) => {
          e.stopPropagation();
          showTypeDropdown = !showTypeDropdown;
          showDayDropdown = false;
          showTimeDropdown = false;
          showServiceBodyDropdown = false;
          showGeoDropdown = false;
        }}
        class="flex w-full items-center justify-between rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-colors {uiState.filters.venueTypes.length > 0 ||
        uiState.filters.formatIds.length > 0
          ? 'bmlt-filter-toggle-active border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
      >
        <span class="truncate">
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
        <Icon name="chevron-down" class="h-3.5 w-3.5 shrink-0 transition-transform {showTypeDropdown ? 'rotate-180' : ''}" />
      </button>
      {#if showTypeDropdown}
        <div class="absolute top-full left-0 z-[1001] mt-1 w-full min-w-[10rem] overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg" style="max-height:min(18rem, 60vh)">
          <div class="px-3 pt-2 pb-0.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">{$t.venueType}</div>
          {#each VENUE_TYPE_VALUES as vt (vt.value)}
            <button
              onclick={() => toggleArrayFilter('venueTypes', vt.value)}
              class="flex w-full items-center gap-2.5 border-0 px-3 py-2 text-start text-sm hover:bg-gray-50 {uiState.filters.venueTypes.includes(vt.value)
                ? 'font-semibold text-blue-700'
                : 'text-gray-700'}"
            >
              <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border {uiState.filters.venueTypes.includes(vt.value) ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}">
                {#if uiState.filters.venueTypes.includes(vt.value)}
                  <Icon name="check" class="h-3 w-3 text-white" strokeWidth={3} />
                {/if}
              </span>
              {$t[vt.key]}
            </button>
          {/each}
          {#if groupedFormatSections.length > 0}
            <div class="my-1 border-t border-gray-100"></div>
            {#each groupedFormatSections as section (section.label)}
              {#if groupedFormatSections.length > 1}
                <div class="px-3 pt-2 pb-0.5 text-xs font-semibold tracking-wide text-gray-400 uppercase">{section.label}</div>
              {/if}
              {#each section.formats as fmt (fmt.id)}
                <button
                  onclick={() => toggleArrayFilter('formatIds', fmt.id)}
                  class="flex w-full items-center gap-2.5 border-0 px-3 py-2 text-start text-sm hover:bg-gray-50 {uiState.filters.formatIds.includes(fmt.id)
                    ? 'font-semibold text-blue-700'
                    : 'text-gray-700'}"
                  title={fmt.description_string}
                >
                  <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border {uiState.filters.formatIds.includes(fmt.id) ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}">
                    {#if uiState.filters.formatIds.includes(fmt.id)}
                      <Icon name="check" class="h-3 w-3 text-white" strokeWidth={3} />
                    {/if}
                  </span>
                  {fmt.name_string}
                </button>
              {/each}
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
            : `${uiState.filters.serviceBodyNames.length} ${$t.selected}`}
        isActive={uiState.filters.serviceBodyNames.length > 0}
        selected={uiState.filters.serviceBodyNames}
        options={availableServiceBodies.map((name) => ({ value: name, label: name }))}
        bind:isOpen={showServiceBodyDropdown}
        onToggle={(v) => toggleArrayFilter('serviceBodyNames', v)}
        onOpen={() => {
          showDayDropdown = false;
          showTimeDropdown = false;
          showTypeDropdown = false;
          showGeoDropdown = false;
        }}
        containerClass={!showViewToggle ? 'col-span-2' : ''}
      />
    {/if}

    <!-- List / Map view toggle -->
    {#if showViewToggle}
      <div class="flex rounded-lg border border-gray-300 bg-white md:ml-auto md:flex-none">
        <button
          onclick={() => setView('list')}
          class="flex flex-1 items-center justify-center gap-1.5 rounded-s-lg px-3 py-2.5 text-sm font-medium transition-colors {uiState.view === 'list'
            ? 'bmlt-btn-primary bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-50'}"
          title={$t.listView}
        >
          <Icon name="filter" class="h-4 w-4" />
          {$t.list}
        </button>
        <button
          onclick={() => setView('map')}
          class="flex flex-1 items-center justify-center gap-1.5 rounded-e-lg px-3 py-2.5 text-sm font-medium transition-colors {uiState.view === 'map'
            ? 'bmlt-btn-primary bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-50'}"
          title={$t.mapView}
        >
          <Icon name="map" class="h-4 w-4" />
          {$t.map}
        </button>
      </div>
    {/if}
  </div>

  {#if activeChips.length > 0}
    <div class="mt-2 flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-2">
      {#each activeChips as chip (chip.key)}
        <button
          onclick={chip.remove}
          class="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 py-0.5 ps-2.5 pe-2 text-xs font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100"
        >
          {chip.label}
          <Icon name="x" class="h-3 w-3 shrink-0" strokeWidth={2.5} />
        </button>
      {/each}
      <button onclick={resetFilters} class="ms-1 text-xs text-gray-400 underline-offset-2 transition-colors hover:text-red-500 hover:underline">
        {$t.clearAllFilters}
      </button>
    </div>
  {/if}
</div>
