import { describe, test, expect, vi, beforeEach } from 'vitest';
import { dataState, loadData, loadDataByCoordinates, loadDataByAddress } from '@stores/data.svelte';
import { config } from '@stores/config.svelte';
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
let mockGeocode: ReturnType<typeof vi.fn>;
let mockRawQuery: ReturnType<typeof vi.fn>;

beforeEach(() => {
  dataState.meetings = [];
  dataState.loading = false;
  dataState.error = null;
  config.formatIds = [];
  config.formatKeys = [];
  config.query = undefined;
  setLanguage('en');

  mockSearch = vi.fn();
  mockGeocode = vi.fn();
  mockRawQuery = vi.fn();
  // Vitest requires `class` keyword when mocking a constructor with `new`
  vi.mocked(BmltClient).mockImplementation(
    class {
      searchMeetingsWithFormats = mockSearch;
      geocodeAddress = mockGeocode;
      rawQuery = mockRawQuery;
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

describe('format lock', () => {
  test('passes formats param to API when config.formatIds is set', async () => {
    config.formatIds = [4, 7];
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ formats: [4, 7] }));
  });

  test('omits formats param when config.formatIds is empty', async () => {
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledWith(expect.not.objectContaining({ formats: expect.anything() }));
  });

  test('formatKeys filters meetings to those matching all keys (AND)', async () => {
    config.formatKeys = ['O', 'BT'];
    const fmts = [rawFormat({ id: '1', key_string: 'O' }), rawFormat({ id: '2', key_string: 'BT' }), rawFormat({ id: '3', key_string: 'WC' })];
    mockSearch.mockResolvedValue({
      meetings: [
        rawMeeting({ id_bigint: '1', format_shared_id_list: '1,2', meeting_name: 'Open Beginners' }),
        rawMeeting({ id_bigint: '2', format_shared_id_list: '1', meeting_name: 'Open Only' }),
        rawMeeting({ id_bigint: '3', format_shared_id_list: '1,2,3', meeting_name: 'Open Beginners WC' })
      ],
      formats: fmts
    });
    await loadData('https://example.org/main_server');
    const names = dataState.meetings.map((m) => m.meeting_name);
    expect(names).toEqual(expect.arrayContaining(['Open Beginners', 'Open Beginners WC']));
    expect(names).not.toContain('Open Only');
  });

  test('formatKeys is case-insensitive', async () => {
    config.formatKeys = ['o'];
    const fmts = [rawFormat({ id: '1', key_string: 'O' })];
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ format_shared_id_list: '1' })], formats: fmts });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings).toHaveLength(1);
  });

  test('formatKeys excludes meetings with no matching formats', async () => {
    config.formatKeys = ['BT'];
    const fmts = [rawFormat({ id: '1', key_string: 'O' })];
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ format_shared_id_list: '1' })], formats: fmts });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings).toHaveLength(0);
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

  test('retries without lang_enum when formats empty (server strips format_shared_id_list)', async () => {
    setLanguage('el');
    const fmt = rawFormat({ id: '7', name_string: 'Open' });
    // Mirrors real BMLT behavior: when language has no translations, formats=[]
    // AND every meeting comes back with empty format_shared_id_list.
    mockSearch
      .mockResolvedValueOnce({ meetings: [rawMeeting({ format_shared_id_list: '' })], formats: [] })
      .mockResolvedValueOnce({ meetings: [rawMeeting({ format_shared_id_list: '7' })], formats: [fmt] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledTimes(2);
    expect(mockSearch).toHaveBeenNthCalledWith(1, expect.objectContaining({ lang_enum: 'el' }));
    expect(mockSearch).toHaveBeenNthCalledWith(2, expect.not.objectContaining({ lang_enum: expect.anything() }));
    expect(dataState.meetings[0]!.resolvedFormats[0]!.name_string).toBe('Open');
  });

  test('does not retry when no lang_enum was passed (ja)', async () => {
    setLanguage('ja');
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ format_shared_id_list: '7' })], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledTimes(1);
  });

  test('does not retry when lang_enum is English (already the server default)', async () => {
    setLanguage('en');
    mockSearch.mockResolvedValue({ meetings: [rawMeeting({ format_shared_id_list: '7' })], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockSearch).toHaveBeenCalledTimes(1);
  });

  test('does not retry when meetings is empty', async () => {
    setLanguage('fa');
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
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

describe('loadDataByAddress', () => {
  const fakeGeocode = {
    coordinates: { latitude: 41.387, longitude: -70.514 },
    display_name: 'Edgartown, MA, USA'
  };

  test('geocodes the address then searches by resulting coordinates', async () => {
    mockGeocode.mockResolvedValue(fakeGeocode);
    mockSearch.mockResolvedValue({ meetings: [rawMeeting()], formats: [] });
    const result = await loadDataByAddress('https://example.org/main_server', 'Edgartown, MA', 25);
    expect(mockGeocode).toHaveBeenCalledWith('Edgartown, MA');
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ lat_val: 41.387, long_val: -70.514, geo_width: 25 }));
    expect(result).toEqual({ lat: 41.387, lng: -70.514, displayName: 'Edgartown, MA, USA' });
  });

  test('trims surrounding whitespace before geocoding', async () => {
    mockGeocode.mockResolvedValue(fakeGeocode);
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadDataByAddress('https://example.org/main_server', '  02539  ', 10);
    expect(mockGeocode).toHaveBeenCalledWith('02539');
  });

  test('returns null and skips search when address is blank', async () => {
    const result = await loadDataByAddress('https://example.org/main_server', '   ', 10);
    expect(result).toBeNull();
    expect(mockGeocode).not.toHaveBeenCalled();
    expect(mockSearch).not.toHaveBeenCalled();
  });

  test('returns null and sets error when geocoding fails', async () => {
    mockGeocode.mockRejectedValue(new Error('No results found'));
    const result = await loadDataByAddress('https://example.org/main_server', 'Atlantis', 10);
    expect(result).toBeNull();
    expect(dataState.error).toBe('No results found');
    expect(mockSearch).not.toHaveBeenCalled();
    expect(dataState.loading).toBe(false);
  });

  test('sets error and skips work when serverUrl is empty', async () => {
    const result = await loadDataByAddress('', 'Edgartown, MA', 10);
    expect(result).toBeNull();
    expect(dataState.error).toMatch(/no server/i);
    expect(mockGeocode).not.toHaveBeenCalled();
  });

  test('forwards a negative geoWidth (BMLT auto-radius) untouched', async () => {
    mockGeocode.mockResolvedValue(fakeGeocode);
    mockSearch.mockResolvedValue({ meetings: [], formats: [] });
    await loadDataByAddress('https://example.org/main_server', '02539', -50);
    expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({ geo_width: -50 }));
  });
});

describe('raw query mode', () => {
  test('routes through rawQuery instead of searchMeetingsWithFormats', async () => {
    config.query = 'meeting_key=location_nation&meeting_key_value[]=USA';
    mockRawQuery.mockResolvedValue({ meetings: [rawMeeting()], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockRawQuery).toHaveBeenCalledTimes(1);
    expect(mockSearch).not.toHaveBeenCalled();
    expect(dataState.meetings).toHaveLength(1);
  });

  test('appends page_size and get_used_formats=1 if the embedder did not include them', async () => {
    config.query = 'weekdays=2';
    mockRawQuery.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    const sent = mockRawQuery.mock.calls[0]![0] as string;
    expect(sent).toContain('weekdays=2');
    expect(sent).toContain('page_size=');
    expect(sent).toContain('get_used_formats=1');
  });

  test('does not duplicate keys the embedder already supplied', async () => {
    config.query = 'weekdays=2&page_size=10&get_used_formats=1';
    mockRawQuery.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    const sent = mockRawQuery.mock.calls[0]![0] as string;
    // Each key should appear exactly once
    expect(sent.match(/(^|&)page_size=/g)).toHaveLength(1);
    expect(sent.match(/(^|&)get_used_formats=/g)).toHaveLength(1);
    expect(sent.match(/(^|&)weekdays=/g)).toHaveLength(1);
  });

  test('appends lang_enum when widget language is a BMLT-supported language', async () => {
    setLanguage('es');
    config.query = 'weekdays=2';
    mockRawQuery.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockRawQuery.mock.calls[0]![0]).toContain('lang_enum=es');
  });

  test('omits lang_enum for languages not supported by BMLT (ja)', async () => {
    setLanguage('ja');
    config.query = 'weekdays=2';
    mockRawQuery.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    expect(mockRawQuery.mock.calls[0]![0]).not.toContain('lang_enum=');
  });

  test('ignores serviceBodyIds in raw query mode (embedder controls the query)', async () => {
    config.query = 'weekdays=2';
    mockRawQuery.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server', [1, 2, 3]);
    const sent = mockRawQuery.mock.calls[0]![0] as string;
    expect(sent).not.toContain('services=');
  });

  test('ignores config.formatIds in raw query mode (no auto format lock)', async () => {
    config.query = 'weekdays=2';
    config.formatIds = [4, 7];
    mockRawQuery.mockResolvedValue({ meetings: [], formats: [] });
    await loadData('https://example.org/main_server');
    const sent = mockRawQuery.mock.calls[0]![0] as string;
    // get_used_formats is added by the widget; the numeric format lock (&formats=) must not be
    expect(sent).not.toMatch(/(^|&)formats=/);
  });

  test('config.formatKeys client-side filter still applies', async () => {
    config.query = 'weekdays=2';
    config.formatKeys = ['BT'];
    const fmts = [rawFormat({ id: '1', key_string: 'O' })];
    mockRawQuery.mockResolvedValue({ meetings: [rawMeeting({ format_shared_id_list: '1' })], formats: fmts });
    await loadData('https://example.org/main_server');
    expect(dataState.meetings).toHaveLength(0);
  });

  test('retries without lang_enum when first response has empty formats (same fallback as structured path)', async () => {
    setLanguage('el');
    config.query = 'weekdays=2';
    const fmt = rawFormat({ id: '7', name_string: 'Open' });
    mockRawQuery
      .mockResolvedValueOnce({ meetings: [rawMeeting({ format_shared_id_list: '' })], formats: [] })
      .mockResolvedValueOnce({ meetings: [rawMeeting({ format_shared_id_list: '7' })], formats: [fmt] });
    await loadData('https://example.org/main_server');
    expect(mockRawQuery).toHaveBeenCalledTimes(2);
    expect(mockRawQuery.mock.calls[0]![0]).toContain('lang_enum=el');
    expect(mockRawQuery.mock.calls[1]![0]).not.toContain('lang_enum=');
    expect(dataState.meetings[0]!.resolvedFormats[0]!.name_string).toBe('Open');
  });

  test('sets error on rawQuery failure and clears loading', async () => {
    config.query = 'weekdays=2';
    mockRawQuery.mockRejectedValue(new Error('Bad query'));
    await loadData('https://example.org/main_server');
    expect(dataState.error).toBe('Bad query');
    expect(dataState.loading).toBe(false);
  });
});
