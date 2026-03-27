import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatTime, getTimeOfDay, formatAddress, sortMeetings, getPlatform, getDirectionsUrl } from '@utils/format';
import type { Meeting } from 'bmlt-query-client';

describe('formatTime', () => {
  test('formats morning time', () => expect(formatTime('09:30:00')).toBe('9:30 AM'));
  test('formats noon', () => expect(formatTime('12:00:00')).toBe('12:00 PM'));
  test('formats midnight', () => expect(formatTime('00:00:00')).toBe('12:00 AM'));
  test('formats afternoon', () => expect(formatTime('14:30:00')).toBe('2:30 PM'));
  test('formats end of day', () => expect(formatTime('23:59:00')).toBe('11:59 PM'));
  test('pads minutes', () => expect(formatTime('08:05:00')).toBe('8:05 AM'));
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
