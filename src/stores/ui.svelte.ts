import type { FilterState, ViewType } from '@/types';

export const uiState = $state<{
  view: ViewType;
  selectedMeetingId: string | null;
  filters: FilterState;
  geoActive: boolean;
}>({
  view: 'list',
  selectedMeetingId: null,
  filters: {
    search: '',
    weekdays: [],
    venueTypes: [],
    timeOfDay: [],
    formatIds: []
  },
  geoActive: false
});

export function setView(view: ViewType): void {
  uiState.view = view;
}

export function selectMeeting(id: string): void {
  uiState.selectedMeetingId = id;
  uiState.view = 'detail';
  history.pushState({ bmltDetail: id }, '');
}

export function clearSelectedMeeting(): void {
  uiState.selectedMeetingId = null;
  uiState.view = 'list';
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
    formatIds: []
  };
}

export function toggleArrayFilter(key: 'weekdays' | 'venueTypes' | 'timeOfDay' | 'formatIds', value: number | string): void {
  const arr = uiState.filters[key] as (number | string)[];
  const idx = arr.indexOf(value);
  if (idx === -1) {
    (uiState.filters[key] as (number | string)[]) = [...arr, value];
  } else {
    (uiState.filters[key] as (number | string)[]) = arr.filter((v) => v !== value);
  }
}
