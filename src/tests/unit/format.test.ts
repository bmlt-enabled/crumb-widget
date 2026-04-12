import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatTime,
  formatEndTime,
  getTimezoneAbbr,
  getTimeOfDay,
  formatAddress,
  sortMeetings,
  isInProgress,
  getPlatform,
  getDirectionsUrl,
  getGeoErrorMessage,
  haversineDistanceMiles,
  filterMeetings
} from '@utils/format';
import type { ProcessedMeeting, FilterState } from '@/types/index';
import type { Meeting } from 'bmlt-query-client';

describe('formatTime', () => {
  test('formats morning time', () => expect(formatTime('09:30:00')).toBe('9:30 AM'));
  test('formats noon', () => expect(formatTime('12:00:00')).toBe('12:00 PM'));
  test('formats midnight', () => expect(formatTime('00:00:00')).toBe('12:00 AM'));
  test('formats afternoon', () => expect(formatTime('14:30:00')).toBe('2:30 PM'));
  test('formats end of day', () => expect(formatTime('23:59:00')).toBe('11:59 PM'));
  test('pads minutes', () => expect(formatTime('08:05:00')).toBe('8:05 AM'));
});

describe('formatEndTime', () => {
  test('adds duration to get end time', () => expect(formatEndTime('09:00:00', '01:30:00')).toBe('10:30 AM'));
  test('handles duration crossing noon', () => expect(formatEndTime('11:00:00', '01:30:00')).toBe('12:30 PM'));
  test('handles duration crossing midnight', () => expect(formatEndTime('23:00:00', '01:30:00')).toBe('12:30 AM'));
  test('handles zero-minute duration', () => expect(formatEndTime('09:00:00', '01:00:00')).toBe('10:00 AM'));
  test('returns null for zero duration', () => expect(formatEndTime('09:00:00', '00:00:00')).toBeNull());
  test('returns null for invalid start time', () => expect(formatEndTime('bad', '01:00:00')).toBeNull());
  test('returns null for invalid duration', () => expect(formatEndTime('09:00:00', 'bad')).toBeNull());
  test('respects 24-hour option', () => expect(formatEndTime('09:00:00', '01:30:00', { force24Hour: true })).toBe('10:30'));
});

describe('getTimezoneAbbr', () => {
  test('returns short abbreviation for valid IANA timezone', () => {
    const abbr = getTimezoneAbbr('America/New_York');
    // Will be EST or EDT depending on time of year — either is correct
    expect(abbr).toMatch(/^E[DS]T$/);
  });
  test('returns short abbreviation for Pacific time', () => {
    const abbr = getTimezoneAbbr('America/Los_Angeles');
    expect(abbr).toMatch(/^P[DS]T$/);
  });
  test('returns the raw string for an invalid timezone', () => {
    expect(getTimezoneAbbr('Not/ATimezone')).toBe('Not/ATimezone');
  });
});

describe('getTimeOfDay', () => {
  test('4am is morning', () => expect(getTimeOfDay('04:00:00')).toBe('morning'));
  test('9am is morning', () => expect(getTimeOfDay('09:00:00')).toBe('morning'));
  test('noon is afternoon', () => expect(getTimeOfDay('12:00:00')).toBe('afternoon'));
  test('2pm is afternoon', () => expect(getTimeOfDay('14:00:00')).toBe('afternoon'));
  test('5pm is evening', () => expect(getTimeOfDay('17:00:00')).toBe('evening'));
  test('8pm is evening', () => expect(getTimeOfDay('20:00:00')).toBe('evening'));
  test('9pm is night', () => expect(getTimeOfDay('21:00:00')).toBe('night'));
  test('midnight is night', () => expect(getTimeOfDay('00:00:00')).toBe('night'));
});

function makeMeeting(overrides: Partial<Meeting> = {}): Meeting {
  return {
    id_bigint: '1',
    weekday_tinyint: 2,
    venue_type: 1,
    start_time: '19:00:00',
    duration_time: '01:00:00',
    meeting_name: 'Test Meeting',
    location_text: '',
    latitude: 0,
    longitude: 0,
    published: 1,
    service_body_bigint: '1',
    ...overrides
  };
}

describe('formatAddress', () => {
  test('builds address from parts', () => {
    const m = makeMeeting({
      location_street: '123 Main St',
      location_municipality: 'Springfield',
      location_province: 'IL',
      location_postal_code_1: '62701'
    });
    expect(formatAddress(m)).toBe('123 Main St, Springfield, IL, 62701');
  });

  test('falls back to location_text when no parts', () => {
    const m = makeMeeting({ location_text: 'Community Center' });
    expect(formatAddress(m)).toBe('Community Center');
  });

  test('omits missing parts', () => {
    const m = makeMeeting({
      location_street: '456 Elm St',
      location_province: 'CA'
    });
    expect(formatAddress(m)).toBe('456 Elm St, CA');
  });

  test('returns empty string when no data', () => {
    expect(formatAddress(makeMeeting())).toBe('');
  });
});

describe('sortMeetings', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('sorts by time within the same day', () => {
    vi.setSystemTime(new Date(2024, 0, 7)); // Sunday (bmlt=1) — today, so all same offset
    const meetings = [makeMeeting({ id_bigint: '2', weekday_tinyint: 1, start_time: '19:00:00' }), makeMeeting({ id_bigint: '1', weekday_tinyint: 1, start_time: '09:00:00' })];
    expect(sortMeetings(meetings).map((m) => m.id_bigint)).toEqual(['1', '2']);
  });

  test('starts from today, not Sunday', () => {
    vi.setSystemTime(new Date(2024, 0, 3)); // Wednesday (getDay=3, bmlt=4)
    const meetings = [
      makeMeeting({ id_bigint: 'sun', weekday_tinyint: 1 }), // offset 4
      makeMeeting({ id_bigint: 'wed', weekday_tinyint: 4 }), // offset 0 — today
      makeMeeting({ id_bigint: 'tue', weekday_tinyint: 3 }) // offset 6
    ];
    expect(sortMeetings(meetings).map((m) => m.id_bigint)).toEqual(['wed', 'sun', 'tue']);
  });

  test('wraps around the end of the week', () => {
    vi.setSystemTime(new Date(2024, 0, 6)); // Saturday (getDay=6, bmlt=7)
    const meetings = [
      makeMeeting({ id_bigint: 'mon', weekday_tinyint: 2 }), // offset 2
      makeMeeting({ id_bigint: 'sat', weekday_tinyint: 7 }), // offset 0 — today
      makeMeeting({ id_bigint: 'sun', weekday_tinyint: 1 }) // offset 1
    ];
    expect(sortMeetings(meetings).map((m) => m.id_bigint)).toEqual(['sat', 'sun', 'mon']);
  });

  test('does not mutate the original array', () => {
    vi.setSystemTime(new Date(2024, 0, 1)); // Monday
    const meetings = [makeMeeting({ id_bigint: '2', weekday_tinyint: 3 }), makeMeeting({ id_bigint: '1', weekday_tinyint: 2 })];
    const original = [...meetings];
    sortMeetings(meetings);
    expect(meetings.map((m) => m.id_bigint)).toEqual(original.map((m) => m.id_bigint));
  });

  test('rolls past meetings on today to the end of the list', () => {
    // Saturday 6:30pm — offset 10min means cutoff is 6:20pm
    vi.setSystemTime(new Date(2024, 0, 6, 18, 30)); // Sat (bmlt=7) at 18:30
    const meetings = [
      makeMeeting({ id_bigint: 'sat-9am', weekday_tinyint: 7, start_time: '09:00:00' }), // past → end
      makeMeeting({ id_bigint: 'sat-6pm', weekday_tinyint: 7, start_time: '18:00:00' }), // past (before 18:20) → end
      makeMeeting({ id_bigint: 'sat-7pm', weekday_tinyint: 7, start_time: '19:00:00' }), // future → first
      makeMeeting({ id_bigint: 'sun', weekday_tinyint: 1, start_time: '10:00:00' }) // tomorrow → second
    ];
    expect(sortMeetings(meetings, 10).map((m) => m.id_bigint)).toEqual(['sat-7pm', 'sun', 'sat-9am', 'sat-6pm']);
  });

  test('meeting within nowOffset window is kept at the top', () => {
    // Saturday 6:30pm — offset 10min means cutoff is 6:20pm; 6:25pm is within window
    vi.setSystemTime(new Date(2024, 0, 6, 18, 30)); // Sat at 18:30
    const meetings = [
      makeMeeting({ id_bigint: 'sat-6:25', weekday_tinyint: 7, start_time: '18:25:00' }), // started 5min ago, within offset → stays
      makeMeeting({ id_bigint: 'sat-6:19', weekday_tinyint: 7, start_time: '18:19:00' }), // started 11min ago, past → end
      makeMeeting({ id_bigint: 'sun', weekday_tinyint: 1, start_time: '10:00:00' })
    ];
    expect(sortMeetings(meetings, 10).map((m) => m.id_bigint)).toEqual(['sat-6:25', 'sun', 'sat-6:19']);
  });

  test('nowOffset=0 means only strictly past meetings roll over', () => {
    vi.setSystemTime(new Date(2024, 0, 6, 18, 30)); // Sat at 18:30; cutoff = 18:30
    const meetings = [
      makeMeeting({ id_bigint: 'sat-18:30', weekday_tinyint: 7, start_time: '18:30:00' }), // exactly now → stays
      makeMeeting({ id_bigint: 'sat-18:29', weekday_tinyint: 7, start_time: '18:29:00' }), // 1min past → end
      makeMeeting({ id_bigint: 'sun', weekday_tinyint: 1, start_time: '10:00:00' })
    ];
    expect(sortMeetings(meetings, 0).map((m) => m.id_bigint)).toEqual(['sat-18:30', 'sun', 'sat-18:29']);
  });
});

describe('isInProgress', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('returns true when meeting started within offset window', () => {
    // Sat 7:15pm — a 7:10pm meeting started 5min ago, within the default 10min window
    vi.setSystemTime(new Date(2024, 0, 6, 19, 15)); // Sat (bmlt=7)
    expect(isInProgress({ weekday_tinyint: 7, start_time: '19:10:00' }, 10)).toBe(true);
  });

  test('returns false when meeting started before the offset window', () => {
    // Sat 7:15pm — a 7:00pm meeting started 15min ago, outside the 10min window
    vi.setSystemTime(new Date(2024, 0, 6, 19, 15));
    expect(isInProgress({ weekday_tinyint: 7, start_time: '19:00:00' }, 10)).toBe(false);
  });

  test('returns false for a future meeting', () => {
    vi.setSystemTime(new Date(2024, 0, 6, 19, 15));
    expect(isInProgress({ weekday_tinyint: 7, start_time: '19:30:00' }, 10)).toBe(false);
  });

  test('returns false for a meeting on a different day', () => {
    // Today is Sat (bmlt=7), meeting is on Sun (bmlt=1)
    vi.setSystemTime(new Date(2024, 0, 6, 19, 15));
    expect(isInProgress({ weekday_tinyint: 1, start_time: '19:10:00' }, 10)).toBe(false);
  });

  test('meeting that started exactly at now is not in progress (not yet started)', () => {
    vi.setSystemTime(new Date(2024, 0, 6, 19, 15));
    expect(isInProgress({ weekday_tinyint: 7, start_time: '19:15:00' }, 10)).toBe(false);
  });

  test('meeting at exactly the offset boundary is in progress', () => {
    // 7:15pm now, offset 10min — cutoff is 7:05pm; 7:05pm meeting is exactly at boundary
    vi.setSystemTime(new Date(2024, 0, 6, 19, 15));
    expect(isInProgress({ weekday_tinyint: 7, start_time: '19:05:00' }, 10)).toBe(true);
  });

  test('nowOffset=0 means only meetings that started in the exact current minute are in progress', () => {
    vi.setSystemTime(new Date(2024, 0, 6, 19, 15));
    // With offset=0, cutoff === nowMinutes, so meetingMinutes must be >= nowMinutes — only future/exact
    // A meeting at 19:14 started before now and is not within offset=0
    expect(isInProgress({ weekday_tinyint: 7, start_time: '19:14:00' }, 0)).toBe(false);
  });

  test('consistent with sortMeetings — in-progress meetings are not rolled to end', () => {
    // Sat 7:15pm, offset 10min: 7:10pm is in-progress (not past), 7:00pm is past (rolled)
    vi.setSystemTime(new Date(2024, 0, 6, 19, 15));
    const inProgress = { weekday_tinyint: 7, start_time: '19:10:00' };
    const past = { weekday_tinyint: 7, start_time: '19:00:00' };
    const sorted = sortMeetings([inProgress, past], 10);
    // in-progress stays near top (effectiveOffset=0), past rolls to end (effectiveOffset=7)
    expect(sorted[0]).toBe(inProgress);
    expect(sorted[1]).toBe(past);
    expect(isInProgress(inProgress, 10)).toBe(true);
    expect(isInProgress(past, 10)).toBe(false);
  });
});

describe('getPlatform', () => {
  const setNav = (ua: string, platform = '', maxTouchPoints = 0) => {
    Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });
    Object.defineProperty(window.navigator, 'platform', { value: platform, configurable: true });
    Object.defineProperty(window.navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true });
  };

  test('detects android', () => {
    setNav('mozilla/5.0 (linux; android 13; pixel 7)');
    expect(getPlatform()).toBe('android');
  });

  test('detects iPhone', () => {
    setNav('mozilla/5.0 (iphone; cpu iphone os 17_0)', 'iPhone', 5);
    expect(getPlatform()).toBe('ios');
  });

  test('detects iPad via MacIntel + maxTouchPoints', () => {
    setNav('mozilla/5.0 (macintosh; intel mac os x 10_15_7)', 'MacIntel', 5);
    expect(getPlatform()).toBe('ios');
  });

  test('returns web for desktop mac', () => {
    setNav('mozilla/5.0 (macintosh; intel mac os x 10_15_7)', 'MacIntel', 0);
    expect(getPlatform()).toBe('web');
  });

  test('returns web for desktop windows', () => {
    setNav('mozilla/5.0 (windows nt 10.0; win64; x64)', 'Win32', 0);
    expect(getPlatform()).toBe('web');
  });
});

describe('getGeoErrorMessage', () => {
  const t = {
    locationDenied: 'Location access denied',
    locationDeniedHint: 'Please enable location sharing in your browser settings, then refresh the page.',
    locationUnavailable: 'Location unavailable',
    locationUnavailableHint: 'Your location could not be determined. Please check your device settings and try again.',
    locationTimeout: 'Location request timed out',
    locationTimeoutHint: 'The location request took too long. Please check your connection and try again.',
    locationError: 'Unable to get location',
    locationErrorHint: 'Something went wrong getting your location. Please try again.'
  };

  test('code 1 returns permission denied', () => expect(getGeoErrorMessage(1, t)).toEqual({ title: 'Location access denied', hint: t.locationDeniedHint }));
  test('code 2 returns unavailable', () => expect(getGeoErrorMessage(2, t)).toEqual({ title: 'Location unavailable', hint: t.locationUnavailableHint }));
  test('code 3 returns timeout', () => expect(getGeoErrorMessage(3, t)).toEqual({ title: 'Location request timed out', hint: t.locationTimeoutHint }));
  test('unknown code returns generic error', () => expect(getGeoErrorMessage(99, t)).toEqual({ title: 'Unable to get location', hint: t.locationErrorHint }));
});

describe('getDirectionsUrl', () => {
  const setNav = (ua: string, platform = '', maxTouchPoints = 0) => {
    Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });
    Object.defineProperty(window.navigator, 'platform', { value: platform, configurable: true });
    Object.defineProperty(window.navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true });
  };

  test('iOS: returns maps:// URL with coordinates', () => {
    setNav('mozilla/5.0 (iphone; cpu iphone os 17_0)', 'iPhone', 5);
    expect(getDirectionsUrl(makeMeeting({ latitude: 34.05, longitude: -118.24 }))).toBe('maps://?daddr=34.05,-118.24');
  });

  test('iOS: falls back to address when no coordinates', () => {
    setNav('mozilla/5.0 (iphone; cpu iphone os 17_0)', 'iPhone', 5);
    expect(getDirectionsUrl(makeMeeting({ latitude: 0, longitude: 0, location_street: '123 Main St', location_municipality: 'Anytown', location_province: 'CA' }))).toBe(
      'maps://?q=123%20Main%20St%2C%20Anytown%2C%20CA'
    );
  });

  test('Android: returns geo: URL', () => {
    setNav('mozilla/5.0 (linux; android 13; pixel 7)');
    expect(getDirectionsUrl(makeMeeting({ latitude: 34.05, longitude: -118.24 }))).toBe('geo:34.05,-118.24?q=34.05,-118.24');
  });

  test('web: returns Google Maps URL with coordinates', () => {
    setNav('mozilla/5.0 (windows nt 10.0)', 'Win32', 0);
    expect(getDirectionsUrl(makeMeeting({ latitude: 34.05, longitude: -118.24 }))).toBe('https://www.google.com/maps/dir/?api=1&destination=34.05,-118.24');
  });

  test('web: falls back to address when no coordinates', () => {
    setNav('mozilla/5.0 (windows nt 10.0)', 'Win32', 0);
    expect(getDirectionsUrl(makeMeeting({ latitude: 0, longitude: 0, location_street: '123 Main St', location_municipality: 'Springfield' }))).toContain('123%20Main%20St');
  });
});

describe('haversineDistanceMiles', () => {
  test('returns 0 for identical coordinates', () => {
    expect(haversineDistanceMiles(34.05, -118.24, 34.05, -118.24)).toBeCloseTo(0);
  });

  test('calculates known distance between two cities', () => {
    // NYC (40.7128, -74.0060) to LA (34.0522, -118.2437) ≈ 2451 miles
    expect(haversineDistanceMiles(40.7128, -74.006, 34.0522, -118.2437)).toBeCloseTo(2451, -2);
  });

  test('is symmetric', () => {
    const a = haversineDistanceMiles(34.05, -118.24, 40.71, -74.01);
    const b = haversineDistanceMiles(40.71, -74.01, 34.05, -118.24);
    expect(a).toBeCloseTo(b, 5);
  });
});

describe('filterMeetings distance filter', () => {
  const emptyFilters: FilterState = { search: '', weekdays: [], venueTypes: [], timeOfDay: [], formatIds: [], serviceBodyNames: [] };

  function makeGeoMeeting(id: string, lat: number, lng: number): ProcessedMeeting {
    return {
      id_bigint: id,
      weekday_tinyint: 2,
      venue_type: 1,
      start_time: '19:00:00',
      duration_time: '01:00:00',
      meeting_name: 'Test',
      location_text: '',
      location_street: '',
      location_municipality: '',
      location_province: '',
      location_postal_code_1: '',
      latitude: lat,
      longitude: lng,
      published: 1,
      service_body_bigint: '1',
      format_shared_id_list: '',
      formattedTime: '7:00 PM',
      formattedAddress: '',
      timeOfDay: 'evening',
      resolvedFormats: [],
      isVirtual: false,
      isInPerson: true
    };
  }

  const userLocation = { lat: 34.05, lng: -118.24 }; // LA
  const nearby = makeGeoMeeting('near', 34.1, -118.3); // ~6 miles away
  const farAway = makeGeoMeeting('far', 40.71, -74.01); // ~2450 miles away

  test('returns all meetings when no userLocation provided', () => {
    expect(filterMeetings([nearby, farAway], emptyFilters)).toHaveLength(2);
  });

  test('returns all meetings when geoRadiusMiles is 0', () => {
    expect(filterMeetings([nearby, farAway], emptyFilters, userLocation, 0)).toHaveLength(2);
  });

  test('filters out meetings beyond radius', () => {
    const result = filterMeetings([nearby, farAway], emptyFilters, userLocation, 25);
    expect(result.map((m) => m.id_bigint)).toEqual(['near']);
  });

  test('includes meetings exactly at the radius boundary', () => {
    const dist = haversineDistanceMiles(userLocation.lat, userLocation.lng, nearby.latitude as number, nearby.longitude as number);
    const result = filterMeetings([nearby], emptyFilters, userLocation, Math.ceil(dist));
    expect(result).toHaveLength(1);
  });

  test('excludes meetings with no coordinates', () => {
    const noCoords = makeGeoMeeting('nocoords', 0, 0);
    const result = filterMeetings([noCoords], emptyFilters, userLocation, 25);
    expect(result).toHaveLength(0);
  });
});
