import type { FilterState, ViewType } from '@/types';
import { push } from '@bmlt-enabled/svelte-spa-router';
import { meetingSlug } from '@utils/format';

// Today as a BMLT weekday_tinyint (1=Sun … 7=Sat) in the viewer's local zone.
// The virtual finder loads one day at a time and defaults to today.
export function todayWeekday(): number {
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- transient read, not stored reactive state
  return new Date().getDay() + 1;
}

export const uiState = $state<{
  view: ViewType;
  filters: FilterState;
  geoActive: boolean;
  userLocation: { lat: number; lng: number } | undefined;
  geoRadius: number;
  virtualDay: number;
}>({
  view: 'list',
  filters: {
    search: '',
    weekdays: [],
    venueTypes: [],
    timeOfDay: [],
    formatIds: [],
    serviceBodyNames: []
  },
  geoActive: false,
  userLocation: undefined,
  geoRadius: 0,
  virtualDay: todayWeekday()
});

export function setView(view: ViewType): void {
  uiState.view = view;
}

// The open meeting is derived from the URL (see App.svelte), so selecting or
// clearing a meeting is just navigation — the router's reactive location drives
// the view, which keeps the in-app and browser Back/Forward buttons in sync.
export function selectMeeting(meeting: { meeting_name: string; id_bigint: string }): void {
  push('/' + meetingSlug(meeting));
}

export function clearSelectedMeeting(): void {
  push('/');
}

export function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]): void {
  uiState.filters[key] = value;
}

export function resetFilters(): void {
  uiState.filters = {
    search: '',
    weekdays: [],
    venueTypes: [],
    timeOfDay: [],
    formatIds: [],
    serviceBodyNames: []
  };
}

export function toggleArrayFilter(key: 'weekdays' | 'venueTypes' | 'timeOfDay' | 'formatIds' | 'serviceBodyNames', value: number | string): void {
  const arr = uiState.filters[key] as (number | string)[];
  const idx = arr.indexOf(value);
  if (idx === -1) {
    (uiState.filters[key] as (number | string)[]) = [...arr, value];
  } else {
    (uiState.filters[key] as (number | string)[]) = arr.filter((v) => v !== value);
  }
}
