import { describe, test, expect } from 'vitest';
import { nextOccurrence, toViewerSchedule, viewerTimeZone } from '@utils/timezone';

// A fixed reference instant: Monday 2026-01-05 12:00 UTC (January → no US DST).
const MON_NOON_UTC = new Date('2026-01-05T12:00:00Z');

describe('nextOccurrence', () => {
  test('returns the next upcoming instance at or after `from`', () => {
    // Sunday (weekday=1) 19:00 in New York; next Sunday after Mon Jan 5 is Jan 11.
    // 19:00 EST (UTC-5) === 2026-01-12T00:00:00Z.
    const instant = nextOccurrence(1, '19:00:00', 'America/New_York', MON_NOON_UTC);
    expect(instant?.toISOString()).toBe('2026-01-12T00:00:00.000Z');
    expect(instant!.getTime()).toBeGreaterThan(MON_NOON_UTC.getTime());
  });

  test('rolls to next week when the weekday matches but time already passed', () => {
    // `from` is Mon 12:00 UTC == 07:00 EST. A Monday 06:00 EST meeting (11:00 UTC)
    // already passed today, so it must roll to the following Monday,
    // Jan 12 06:00 EST = 11:00 UTC.
    const instant = nextOccurrence(2, '06:00:00', 'America/New_York', MON_NOON_UTC);
    expect(instant?.toISOString()).toBe('2026-01-12T11:00:00.000Z');
  });

  test('returns null for unparseable input', () => {
    expect(nextOccurrence(1, 'not-a-time', 'America/New_York', MON_NOON_UTC)).toBeNull();
    expect(nextOccurrence(0, '19:00:00', 'America/New_York', MON_NOON_UTC)).toBeNull();
  });
});

describe('toViewerSchedule', () => {
  test('shifts time backward for a viewer west of the meeting', () => {
    // Sunday 19:00 New York, viewed from Los Angeles (3h behind) → Sunday 16:00.
    const local = toViewerSchedule(1, '19:00:00', 'America/New_York', 'America/Los_Angeles', MON_NOON_UTC);
    expect(local?.weekday).toBe(1); // still Sunday
    expect(local?.startTime).toBe('16:00:00');
  });

  test('is identity when source and viewer zones match', () => {
    const local = toViewerSchedule(1, '19:00:00', 'America/New_York', 'America/New_York', MON_NOON_UTC);
    expect(local?.weekday).toBe(1);
    expect(local?.startTime).toBe('19:00:00');
  });

  test('rolls the weekday forward across the international date line', () => {
    // Sunday 23:00 London (UTC+0 in Jan) → Tokyo (UTC+9) is Monday 08:00.
    const local = toViewerSchedule(1, '23:00:00', 'Europe/London', 'Asia/Tokyo', MON_NOON_UTC);
    expect(local?.weekday).toBe(2); // Monday
    expect(local?.startTime).toBe('08:00:00');
  });
});

describe('viewerTimeZone', () => {
  test('returns a non-empty IANA zone string', () => {
    expect(viewerTimeZone()).toMatch(/^[A-Za-z]+(?:\/[A-Za-z0-9_+-]+)*$/);
  });
});
