import type { FilterState, ViewType } from '@/types';
import { push } from '@bmlt-enabled/svelte-spa-router';
import { config } from './config.svelte';
import { meetingSlug } from '@utils/format';

export const uiState = $state<{
  view: ViewType;
  filters: FilterState;
  geoActive: boolean;
  selectedMeetingId: string | null;
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
  selectedMeetingId: null
});

export function setView(view: ViewType): void {
  uiState.view = view;
}

function withBase(path: string): string {
  const base = config.basePath.replace(/\/$/, '');
  return base + path;
}

export function selectMeeting(meeting: { meeting_name: string; id_bigint: string }): void {
  uiState.selectedMeetingId = meeting.id_bigint;
  push(withBase('/' + meetingSlug(meeting)));
}

export function clearSelectedMeeting(): void {
  uiState.selectedMeetingId = null;
  push(withBase('/'));
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
