import type { FilterState, ViewType } from '@/types';
import { push } from '@bmlt-enabled/svelte-spa-router';
import { meetingSlug } from '@utils/format';

export const uiState = $state<{
  view: ViewType;
  filters: FilterState;
  geoActive: boolean;
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
  geoActive: false
});

export function setView(view: ViewType): void {
  uiState.view = view;
}

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
