import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatGoogleCalendarUrl, downloadIcs } from '@utils/calendar';
import type { ProcessedMeeting } from '@/types';

function makeMeeting(overrides: Partial<ProcessedMeeting> = {}): ProcessedMeeting {
  return {
    id_bigint: '1',
    weekday_tinyint: 2, // Monday (BMLT)
    venue_type: 1,
    start_time: '19:00:00',
    duration_time: '01:00:00',
    meeting_name: 'Test Meeting',
    location_text: '',
    latitude: 0,
    longitude: 0,
    published: 1,
    service_body_bigint: '1',
    formattedTime: '7:00 PM',
    formattedAddress: '',
    timeOfDay: 'evening',
    dayName: 'Monday',
    dayShort: 'Mon',
    resolvedFormats: [],
    isVirtual: false,
    isInPerson: true,
    ...overrides
  };
}

function parseGoogleUrl(url: string) {
  const [base, qs] = url.split('?');
  return { base, params: new URLSearchParams(qs) };
}

// ─── formatGoogleCalendarUrl ──────────────────────────────────────────────────

describe('formatGoogleCalendarUrl', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('returns Google Calendar base URL', () => {
    vi.setSystemTime(new Date(2024, 0, 3)); // Wednesday
    const { base } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting()));
    expect(base).toBe('https://calendar.google.com/calendar/render');
  });

  test('action=TEMPLATE', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting()));
    expect(params.get('action')).toBe('TEMPLATE');
  });

  test('text is the meeting name', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ meeting_name: 'Monday Night Group' })));
    expect(params.get('text')).toBe('Monday Night Group');
  });

  test('dates are in YYYYMMDDTHHmmss/YYYYMMDDTHHmmss format', () => {
    vi.setSystemTime(new Date(2024, 0, 3, 10, 0, 0));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting()));
    expect(params.get('dates')).toMatch(/^\d{8}T\d{6}\/\d{8}T\d{6}$/);
  });

  test('future day: picks the correct next date', () => {
    vi.setSystemTime(new Date(2024, 0, 3, 10, 0, 0)); // Wednesday Jan 3 10am
    // Monday (tinyint=2) is 5 days away → Jan 8
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00' })));
    expect(params.get('dates')).toMatch(/^20240108T190000/);
  });

  test('same day, time in future: uses today', () => {
    vi.setSystemTime(new Date(2024, 0, 3, 10, 0, 0)); // Wednesday Jan 3 10am
    // Wednesday (tinyint=4) at 2pm — still ahead
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ weekday_tinyint: 4, start_time: '14:00:00' })));
    expect(params.get('dates')).toMatch(/^20240103T140000/);
  });

  test('same day, time in past: advances one week', () => {
    vi.setSystemTime(new Date(2024, 0, 3, 10, 0, 0)); // Wednesday Jan 3 10am
    // Wednesday (tinyint=4) at 8am — already passed
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ weekday_tinyint: 4, start_time: '08:00:00' })));
    expect(params.get('dates')).toMatch(/^20240110T080000/); // Jan 10
  });

  test('end time is start + duration', () => {
    vi.setSystemTime(new Date(2024, 0, 3, 10, 0, 0));
    // Monday 7pm, 90-min duration → ends 8:30pm
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00', duration_time: '01:30:00' })));
    const [, endStr] = params.get('dates')!.split('/');
    expect(endStr).toMatch(/T203000$/);
  });

  test('end time defaults to 1 hour when no duration', () => {
    vi.setSystemTime(new Date(2024, 0, 3, 10, 0, 0));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00', duration_time: undefined })));
    const [, endStr] = params.get('dates')!.split('/');
    expect(endStr).toMatch(/T200000$/);
  });

  test('recur contains RRULE:FREQ=WEEKLY;BYDAY=MO for Monday', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ weekday_tinyint: 2 })));
    expect(params.get('recur')).toBe('RRULE:FREQ=WEEKLY;BYDAY=MO');
  });

  test('BYDAY is correct for every weekday', () => {
    vi.setSystemTime(new Date(2024, 0, 7)); // Sunday — all days in future
    const expected = ['', 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    for (let i = 1; i <= 7; i++) {
      const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ weekday_tinyint: i })));
      expect(params.get('recur')).toContain(`BYDAY=${expected[i]}`);
    }
  });

  test('includes ctz when time_zone is set', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ time_zone: 'America/New_York' })));
    expect(params.get('ctz')).toBe('America/New_York');
  });

  test('omits ctz when time_zone is absent', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ time_zone: undefined })));
    expect(params.has('ctz')).toBe(false);
  });

  test('location is address for in-person meeting', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ isInPerson: true, location_text: 'Community Center', formattedAddress: '123 Main St, Springfield, IL' })));
    expect(params.get('location')).toBe('Community Center, 123 Main St, Springfield, IL');
  });

  test('location omits empty location_text', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ isInPerson: true, location_text: '', formattedAddress: '123 Main St' })));
    expect(params.get('location')).toBe('123 Main St');
  });

  test('location is set when only location_text is present (no address)', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ isInPerson: true, location_text: 'First Baptist Church', formattedAddress: '' })));
    expect(params.get('location')).toBe('First Baptist Church');
  });

  test('location is virtual link for online-only meeting', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ isInPerson: false, isVirtual: true, virtual_meeting_link: 'https://zoom.us/j/123' })));
    expect(params.get('location')).toBe('https://zoom.us/j/123');
  });

  test('details include comments', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ comments: 'Bring a book' })));
    expect(params.get('details')).toContain('Bring a book');
  });

  test('details include virtual join link', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ isVirtual: true, virtual_meeting_link: 'https://zoom.us/j/123' })));
    expect(params.get('details')).toContain('Join: https://zoom.us/j/123');
  });

  test('no details param when nothing to include', () => {
    vi.setSystemTime(new Date(2024, 0, 3));
    const { params } = parseGoogleUrl(formatGoogleCalendarUrl(makeMeeting({ isVirtual: false, comments: undefined })));
    expect(params.has('details')).toBe(false);
  });
});

// ─── downloadIcs ─────────────────────────────────────────────────────────────

describe('downloadIcs', () => {
  const setNav = (ua: string, platform = '', maxTouchPoints = 0) => {
    Object.defineProperty(window.navigator, 'userAgent', { value: ua, configurable: true });
    Object.defineProperty(window.navigator, 'platform', { value: platform, configurable: true });
    Object.defineProperty(window.navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 3, 10, 0, 0)); // Wednesday Jan 3 10am
    setNav('Mozilla/5.0 (Windows NT 10.0)', 'Win32', 0); // non-iOS
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /** Capture the Blob passed to createObjectURL and return its text content. */
  async function captureIcs(meeting: ProcessedMeeting): Promise<string> {
    let blob: Blob | null = null;
    vi.mocked(URL.createObjectURL).mockImplementation((b) => {
      blob = b as Blob;
      return 'blob:fake';
    });
    downloadIcs(meeting);
    return blob!.text();
  }

  test('wraps content in VCALENDAR', async () => {
    const ics = await captureIcs(makeMeeting());
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
  });

  test('wraps event in VEVENT', async () => {
    const ics = await captureIcs(makeMeeting());
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
  });

  test('SUMMARY is the meeting name', async () => {
    const ics = await captureIcs(makeMeeting({ meeting_name: 'Monday Night Group' }));
    expect(ics).toContain('SUMMARY:Monday Night Group');
  });

  test('DTSTART uses TZID and correct date/time', async () => {
    // Monday (tinyint=2) at 7pm, 5 days from Jan 3 → Jan 8
    const ics = await captureIcs(makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00', time_zone: 'America/New_York' }));
    expect(ics).toContain('DTSTART;TZID=America/New_York:20240108T190000');
  });

  test('DTEND is start + default 1-hour duration', async () => {
    const ics = await captureIcs(makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00', time_zone: 'America/New_York' }));
    expect(ics).toContain('DTEND;TZID=America/New_York:20240108T200000');
  });

  test('DTEND respects custom duration', async () => {
    const ics = await captureIcs(makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00', duration_time: '01:30:00', time_zone: 'America/New_York' }));
    expect(ics).toContain('DTEND;TZID=America/New_York:20240108T203000');
  });

  test('RRULE is weekly with correct BYDAY for Monday', async () => {
    const ics = await captureIcs(makeMeeting({ weekday_tinyint: 2 }));
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=MO');
  });

  test('RRULE BYDAY for Saturday', async () => {
    const ics = await captureIcs(makeMeeting({ weekday_tinyint: 7 }));
    expect(ics).toContain('RRULE:FREQ=WEEKLY;BYDAY=SA');
  });

  test('LOCATION included for in-person meeting with commas escaped', async () => {
    const ics = await captureIcs(makeMeeting({ isInPerson: true, location_text: 'Church Hall', formattedAddress: '123 Main St, Springfield, IL' }));
    expect(ics).toContain('LOCATION:Church Hall\\, 123 Main St\\, Springfield\\, IL');
  });

  test('LOCATION is set when only location_text is present (no address)', async () => {
    const ics = await captureIcs(makeMeeting({ isInPerson: true, location_text: 'First Baptist Church', formattedAddress: '' }));
    expect(ics).toContain('LOCATION:First Baptist Church');
  });

  test('no LOCATION for virtual-only meeting', async () => {
    const ics = await captureIcs(makeMeeting({ isInPerson: false, location_text: '', formattedAddress: '' }));
    expect(ics).not.toContain('LOCATION:');
  });

  test('DESCRIPTION includes comments', async () => {
    const ics = await captureIcs(makeMeeting({ comments: 'Bring a book' }));
    expect(ics).toContain('DESCRIPTION:Bring a book');
  });

  test('DESCRIPTION includes virtual join link', async () => {
    const ics = await captureIcs(makeMeeting({ isVirtual: true, virtual_meeting_link: 'https://zoom.us/j/123' }));
    expect(ics).toContain('Join: https://zoom.us/j/123');
  });

  test('no DESCRIPTION when no comments or virtual info', async () => {
    const ics = await captureIcs(makeMeeting({ isVirtual: false, comments: undefined }));
    expect(ics).not.toContain('DESCRIPTION:');
  });

  test('lines are separated by CRLF', async () => {
    const ics = await captureIcs(makeMeeting());
    expect(ics).toContain('\r\n');
  });

  test('triggers anchor click to download file', () => {
    downloadIcs(makeMeeting());
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  test('download filename is meeting name + .ics', () => {
    const anchors: HTMLAnchorElement[] = [];
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLAnchorElement) anchors.push(node);
      return node;
    });
    downloadIcs(makeMeeting({ meeting_name: 'My Group' }));
    expect(anchors[0]?.download).toBe('My Group.ics');
  });

  test('on iOS: uses FileReader instead of createObjectURL', () => {
    setNav('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)', 'iPhone', 5);
    const mockRead = vi.fn();
    const MockFileReader = vi.fn(function (this: Partial<FileReader>) {
      this.readAsDataURL = mockRead;
      this.onload = null;
    });
    vi.stubGlobal('FileReader', MockFileReader);

    downloadIcs(makeMeeting());

    expect(mockRead).toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
