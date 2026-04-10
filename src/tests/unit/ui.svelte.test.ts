import { describe, test, expect, vi, beforeEach } from 'vitest';
import { uiState, setView, selectMeeting, updateFilter, resetFilters, toggleArrayFilter } from '@stores/ui.svelte';

vi.mock('@bmlt-enabled/svelte-spa-router', () => ({ push: vi.fn() }));

import { push } from '@bmlt-enabled/svelte-spa-router';

beforeEach(() => {
  uiState.view = 'list';
  uiState.geoActive = false;
  resetFilters();
  vi.mocked(push).mockClear();
});

describe('setView', () => {
  test('sets view to map', () => {
    setView('map');
    expect(uiState.view).toBe('map');
  });

  test('sets view to list', () => {
    uiState.view = 'map';
    setView('list');
    expect(uiState.view).toBe('list');
  });
});

describe('selectMeeting', () => {
  test('pushes the meeting slug as a route', () => {
    selectMeeting({ meeting_name: 'Monday Night Meeting', id_bigint: '42' });
    expect(push).toHaveBeenCalledWith('/monday-night-meeting-42');
  });

  test('slugifies special characters in meeting name', () => {
    selectMeeting({ meeting_name: "Bill's Place!", id_bigint: '7' });
    expect(push).toHaveBeenCalledWith('/bill-s-place-7');
  });

  test('falls back to "meeting" slug for names with no alphanumeric chars', () => {
    selectMeeting({ meeting_name: '???', id_bigint: '99' });
    expect(push).toHaveBeenCalledWith('/meeting-99');
  });
});

describe('updateFilter', () => {
  test('updates search filter', () => {
    updateFilter('search', 'serenity');
    expect(uiState.filters.search).toBe('serenity');
  });

  test('updates weekdays filter', () => {
    updateFilter('weekdays', [2, 4]);
    expect(uiState.filters.weekdays).toEqual([2, 4]);
  });

  test('updates venueTypes filter', () => {
    updateFilter('venueTypes', [1]);
    expect(uiState.filters.venueTypes).toEqual([1]);
  });

  test('updates timeOfDay filter', () => {
    updateFilter('timeOfDay', ['morning', 'evening']);
    expect(uiState.filters.timeOfDay).toEqual(['morning', 'evening']);
  });

  test('updates formatIds filter', () => {
    updateFilter('formatIds', ['1', '2']);
    expect(uiState.filters.formatIds).toEqual(['1', '2']);
  });
});

describe('resetFilters', () => {
  test('clears all filter state to defaults', () => {
    updateFilter('search', 'test');
    updateFilter('weekdays', [2]);
    updateFilter('venueTypes', [1]);
    updateFilter('timeOfDay', ['morning']);
    updateFilter('formatIds', ['abc']);
    resetFilters();
    expect(uiState.filters).toEqual({
      search: '',
      weekdays: [],
      venueTypes: [],
      timeOfDay: [],
      formatIds: [],
      serviceBodyNames: []
    });
  });
});

describe('toggleArrayFilter', () => {
  test('adds a value not already in the array', () => {
    toggleArrayFilter('weekdays', 2);
    expect(uiState.filters.weekdays).toEqual([2]);
  });

  test('removes a value already in the array', () => {
    toggleArrayFilter('weekdays', 2);
    toggleArrayFilter('weekdays', 2);
    expect(uiState.filters.weekdays).toEqual([]);
  });

  test('preserves other values when removing one', () => {
    toggleArrayFilter('weekdays', 2);
    toggleArrayFilter('weekdays', 4);
    toggleArrayFilter('weekdays', 2);
    expect(uiState.filters.weekdays).toEqual([4]);
  });

  test('works with string values for formatIds', () => {
    toggleArrayFilter('formatIds', 'abc');
    expect(uiState.filters.formatIds).toContain('abc');
    toggleArrayFilter('formatIds', 'abc');
    expect(uiState.filters.formatIds).not.toContain('abc');
  });

  test('accumulates multiple timeOfDay values', () => {
    toggleArrayFilter('timeOfDay', 'morning');
    toggleArrayFilter('timeOfDay', 'evening');
    expect(uiState.filters.timeOfDay).toEqual(['morning', 'evening']);
  });

  test('accumulates multiple venueType values', () => {
    toggleArrayFilter('venueTypes', 1);
    toggleArrayFilter('venueTypes', 2);
    expect(uiState.filters.venueTypes).toEqual([1, 2]);
  });
});
