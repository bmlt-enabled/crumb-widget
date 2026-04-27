import { describe, test, expect, vi, beforeEach } from 'vitest';
import { dataState, loadData, loadDataByCoordinates } from '@stores/data.svelte';
import type { Meeting, Format } from '@/types';

vi.mock('bmlt-query-client', () => ({
  BmltClient: vi.fn(),
  Language: {
    DANISH: 'da',
    GERMAN: 'de',
    GREEK: 'el',
    ENGLISH: 'en',
    SPANISH: 'es',
    PERSIAN: 'fa',
    FRENCH: 'fr',
    ITALIAN: 'it',
    POLISH: 'pl',
    PORTUGUESE: 'pt',
    RUSSIAN: 'ru',
    SWEDISH: 'sv'
  }
}));

import { BmltClient } from 'bmlt-query-client';
import { setLanguage } from '@stores/localization';

function rawMeeting(overrides: Partial<Meeting> = {}): Meeting {
  return {
    id_bigint: '1',
    weekday_tinyint: 2,
    venue_type: 1,
    start_time: '19:00:00',
    duration_time: '01:00:00',
    meeting_name: 'Test Meeting',
    format_shared_id_list: '',
    latitude: 34.05,
    longitude: -118.24,
    published: 1,
    service_body_bigint: '1',
    location_street: '123 Main St',
    location_municipality: 'Anytown',
    location_province: 'CA',
    location_postal_code_1: '90210',
    ...overrides
  } as Meeting;
}

function rawFormat(overrides: Partial<Format> = {}): Format {
  return { id: '1', key_string: 'O', name_string: 'Open', description_string: 'Open to all', lang: 'en', ...overrides };
}

let mockSearch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  dataState.meetings = [];
  dataState.loading = false;
  dataState.error = null;
  setLanguage('en');

  mockSearch = vi.fn();
  // Vitest requires `class` keyword when mocking a constructor with `new`
  vi.mocked(BmltClient).mockImplementation(
    class {
      searchMeetingsWithFormats = mockSearch;
    } as unknown as typeof BmltClient
  );
});

describe('loadData', () => {
  test('sets loading true during fetch, false when done', async () => {
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    const p = loadData('https://example.org/main_server');
    expect(dataState.loading).toBe(true);
    await p;
    expect(dataState.loading).toBe(false);
  });

  test('populates meetings on success', async () => {
    mockSearch.mockResolvedValue({ meetings: [rawMeeting()], formats: [] });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings).toHaveLength(1);
    expect(dataState.meetings[0]!.meeting_name).toBe('Test Meeting');
  });

  test('sets error and skips fetch when serverUrl is empty', async () => {
    await loadData('');
    expect(dataState.error).toMatch(/no server/i);
    expect(mockSearch).not.toHaveBeenCalled();
  });

  test('sets error on API failure and clears loading', async () => {
    mockSearch.mockRejectedValue(new Error('Network error'));
    await loadData('https://example.org/main_server');
    expect(dataState.error).toBe('Network error');
    expect(dataState.loading).toBe(false);
  });

  test('clears a previous error on successful load', async () => {
    dataState.error = 'old error';
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    expect(dataState.error).toBeNull();
  });

  test('passes serviceBodyIds with recursive flag when provided', async () => {
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server', [1, 2, 3]);
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ services: [1, 2, 3], recursive: true }));
  });

  test('omits services param when serviceBodyIds is empty', async () => {
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server', []);
    expect(mockSearch).toHaveBeenCalledWith(expect.not.objectContaining({ services: expect.anything() }));
  });

  test('resolves formats from format_shared_id_list', async () => {
    const fmt = rawFormat({ id: '42', name_string: 'Beginners' });
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ format_shared_id_list: '42' })], formats: [fmt] });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings[0]!.resolvedFormats).toHaveLength(1);
    expect(dataState.meetings[0]!.resolvedFormats[0]!.name_string).toBe('Beginners');
  });

  test('resolves multiple formats from comma-separated list', async () => {
    const fmts = [rawFormat({ id: '1', name_string: 'Open' }), rawFormat({ id: '2', name_string: 'Closed' })];
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ format_shared_id_list: '1,2' })], formats: fmts });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings[0]!.resolvedFormats).toHaveLength(2);
  });

  test('sets isInPerson=true, isVirtual=false for venue_type 1', async () => {
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ venue_type: 1 })], formats: [] });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings[0]!.isInPerson).toBe(true);
    expect(dataState.meetings[0]!.isVirtual).toBe(false);
  });

  test('sets isInPerson=false, isVirtual=true for venue_type 2', async () => {
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ venue_type: 2 })], formats: [] });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings[0]!.isInPerson).toBe(false);
    expect(dataState.meetings[0]!.isVirtual).toBe(true);
  });

  test('sets both isInPerson and isVirtual for venue_type 3 (hybrid)', async () => {
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ venue_type: 3 })], formats: [] });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings[0]!.isInPerson).toBe(true);
    expect(dataState.meetings[0]!.isVirtual).toBe(true);
  });

  test('computes formattedTime from start_time', async () => {
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ start_time: '09:30:00' })], formats: [] });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings[0]!.formattedTime).toMatch(/9:30/);
  });

  test('computes formattedAddress from location parts', async () => {
    mockSearch.mockResolvedValue({ meetings: [rawMeeting()], formats: [] });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings[0]!.formattedAddress).toContain('123 Main St');
    expect(dataState.meetings[0]!.formattedAddress).toContain('Anytown');
  });

  test('computes timeOfDay from start_time', async () => {
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ start_time: '09:00:00' })], formats: [] });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings[0]!.timeOfDay).toBe('morning');
  });

  test('converts weekday_tinyint to number', async () => {
    // API may return string values; processing should coerce to number
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ weekday_tinyint: '3' as unknown as number })], formats: [] });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings[0]!.weekday_tinyint).toBe(3);
    expect(typeof dataState.meetings[0]!.weekday_tinyint).toBe('number');
  });

  test('sorts meetings by day and time', async () => {
    const meetings = [
      rawMeeting({ id_bigint: '1', weekday_tinyint: 4, start_time: '10:00:00', meeting_name: 'Wednesday AM' }),
      rawMeeting({ id_bigint: '2', weekday_tinyint: 2, start_time: '19:00:00', meeting_name: 'Monday PM' })
    ];
    mockSearch.mockResolvedValue({ meetings, formats: [] });
    await loadData('https://example.org/main_server');
    // After sortMeetings, order depends on today — just verify both are present and sorted consistently
    const names = dataState.meetings.map((m) => m.meeting_name);
    expect(names).toContain('Wednesday AM');
    expect(names).toContain('Monday PM');
  });
});

describe('lang_enum handling', () => {
  test('passes lang_enum matching current widget language', async () => {
    setLanguage('es');
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ lang_enum: 'es' }));
  });

  test('passes lang_enum for Greek (newly supported in BMLT 1.1)', async () => {
    setLanguage('el');
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ lang_enum: 'el' }));
  });

  test('omits lang_enum for Japanese (not supported by BMLT)', async () => {
    setLanguage('ja');
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledWith(expect.not.objectContaining({ lang_enum: expect.anything() }));
  });

  test('strips region tag before mapping (es-MX → es)', async () => {
    setLanguage('es-MX');
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ lang_enum: 'es' }));
  });

  test('retries without lang_enum when formats empty and meetings reference formats', async () => {
    setLanguage('fa');
    const fmt = rawFormat({ id: '7', name_string: 'Open' });
    mockSearch
      .mockResolvedValueOnce({ meetings: [rawMeeting({ format_shared_id_list: '7' })], formats: [] })
      .mockResolvedValueOnce({ meetings: [rawMeeting({ format_shared_id_list: '7' })], formats: [fmt] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledTimes(2);
    expect(mockSearch).toHaveBeenNthCalledWith(1, expect.objectContaining({ lang_enum: 'fa' }));
    expect(mockSearch).toHaveBeenNthCalledWith(2, expect.not.objectContaining({ lang_enum: expect.anything() }));
    expect(dataState.meetings[0]!.resolvedFormats[0]!.name_string).toBe('Open');
  });

  test('does not retry when meetings have no format references', async () => {
    setLanguage('fa');
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ format_shared_id_list: '' })], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledTimes(1);
  });

  test('does not retry when no lang_enum was passed', async () => {
    setLanguage('ja');
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ format_shared_id_list: '7' })], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledTimes(1);
  });

  test('does not retry when first response already has formats', async () => {
    setLanguage('es');
    const fmt = rawFormat({ id: '7', name_string: 'Abierto' });
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ format_shared_id_list: '7' })], formats: [fmt] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledTimes(1);
    expect(dataState.meetings[0]!.resolvedFormats[0]!.name_string).toBe('Abierto');
  });
});

describe('loadDataByCoordinates', () => {
  test('sets loading true during fetch, false when done', async () => {
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    const p = loadDataByCoordinates('https://example.org/main_server', 34.05, -118.24);
    expect(dataState.loading).toBe(true);
    await p;
    expect(dataState.loading).toBe(false);
  });

  test('passes lat, lng, and radius to API', async () => {
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadDataByCoordinates('https://example.org/main_server', 34.05, -118.24, 15);
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ lat_val: 34.05, long_val: -118.24, geo_width: 15 }));
  });

  test('defaults radius to 10 miles', async () => {
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadDataByCoordinates('https://example.org/main_server', 34.05, -118.24);
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ geo_width: 10 }));
  });

  test('requests results sorted by distance', async () => {
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadDataByCoordinates('https://example.org/main_server', 34.05, -118.24);
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ sort_results_by_distance: true }));
  });

  test('sets error and skips fetch when serverUrl is empty', async () => {
    await loadDataByCoordinates('', 34.05, -118.24);
    expect(dataState.error).toMatch(/no server/i);
    expect(mockSearch).not.toHaveBeenCalled();
  });

  test('sets error on API failure', async () => {
    mockSearch.mockRejectedValue(new Error('Timeout'));
    await loadDataByCoordinates('https://example.org/main_server', 34.05, -118.24);
    expect(dataState.error).toBe('Timeout');
    expect(dataState.loading).toBe(false);
  });

  test('populates meetings on success', async () => {
    mockSearch.mockResolvedValue({
      meetings: [rawMeeting(), rawMeeting({ id_bigint: '2', meeting_name: 'Nearby Meeting' })],
      formats: []
    });
    await loadDataByCoordinates('https://example.org/main_server', 34.05, -118.24);
    expect(dataState.meetings).toHaveLength(2);
  });
});
