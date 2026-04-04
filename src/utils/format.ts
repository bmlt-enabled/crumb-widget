import { VENUE_TYPE } from '@/types/index';
import type { Meeting, ProcessedMeeting, FilterState } from '@/types/index';

export function is24HourTime(locale?: string): boolean {
  return !new Intl.DateTimeFormat(locale, {
    hour: 'numeric'
  }).resolvedOptions().hour12;
}

export function formatTime(
  timeStr: string,
  options?: {
    locale?: string;
    force24Hour?: boolean;
  }
): string {
  const [hStr, mStr] = timeStr.split(':');
  const hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return timeStr;
  }

  const use24Hour = options?.force24Hour ?? is24HourTime(options?.locale);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat(options?.locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24Hour
  }).format(date);
}

export function formatEndTime(startTimeStr: string, durationStr: string, options?: { locale?: string; force24Hour?: boolean }): string | null {
  const [sh, sm] = startTimeStr.split(':').map(Number);
  const [dh, dm] = durationStr.split(':').map(Number);
  if ([sh, sm, dh, dm].some(Number.isNaN)) return null;
  const totalMins = sh * 60 + sm + dh * 60 + dm;
  if (totalMins === sh * 60 + sm) return null; // zero duration
  const date = new Date();
  date.setHours(Math.floor(totalMins / 60) % 24, totalMins % 60, 0, 0);
  const use24Hour = options?.force24Hour ?? is24HourTime(options?.locale);
  return new Intl.DateTimeFormat(options?.locale, { hour: 'numeric', minute: '2-digit', hour12: !use24Hour }).format(date);
}

export function getTimezoneAbbr(timezone: string): string {
  try {
    const part = new Intl.DateTimeFormat('en', { timeZone: timezone, timeZoneName: 'short' }).formatToParts(new Date()).find((p) => p.type === 'timeZoneName');
    return part?.value ?? timezone;
  } catch {
    return timezone;
  }
}

export function getTimeOfDay(timeStr: string): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = parseInt(timeStr.split(':')[0], 10);
  if (h >= 4 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

export function formatAddress(meeting: Meeting): string {
  const parts: string[] = [];
  if (meeting.location_street) parts.push(meeting.location_street);
  if (meeting.location_municipality) parts.push(meeting.location_municipality);
  if (meeting.location_province) parts.push(meeting.location_province);
  if (meeting.location_postal_code_1) parts.push(meeting.location_postal_code_1);
  return parts.join(', ') || meeting.location_text || '';
}

export function formatShortAddress(meeting: Meeting): string {
  const parts: string[] = [];
  if (meeting.location_street) parts.push(meeting.location_street);
  if (meeting.location_municipality) parts.push(meeting.location_municipality);
  return parts.join(', ') || meeting.location_text || '';
}

export function isInProgress(meeting: { weekday_tinyint: number; start_time: string }, nowOffsetMinutes: number = 10): boolean {
  const now = new Date();
  const today = now.getDay() + 1; // BMLT: 1=Sun…7=Sat
  if (meeting.weekday_tinyint !== today) return false;
  const [hStr, mStr] = meeting.start_time.split(':');
  const meetingMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return meetingMinutes < nowMinutes && meetingMinutes >= nowMinutes - nowOffsetMinutes;
}

export function sortMeetings<T extends { weekday_tinyint: number; start_time: string }>(meetings: T[], nowOffsetMinutes: number = 10): T[] {
  // Rotate so today's weekday sorts first; BMLT weekday_tinyint is 1=Sun…7=Sat
  // Meetings that started more than nowOffsetMinutes ago today are pushed to the end.
  const now = new Date();
  const today = now.getDay() + 1; // 1–7 matching BMLT
  const cutoffMinutes = now.getHours() * 60 + now.getMinutes() - nowOffsetMinutes;

  const effectiveOffset = (day: number, startTime: string) => {
    const dayOffset = (day - today + 7) % 7;
    if (dayOffset === 0) {
      const [hStr, mStr] = startTime.split(':');
      const meetingMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
      if (meetingMinutes < cutoffMinutes) {
        return 7; // push past meetings to end of the week cycle
      }
    }
    return dayOffset;
  };

  return [...meetings].sort((a, b) => {
    const offA = effectiveOffset(a.weekday_tinyint, a.start_time);
    const offB = effectiveOffset(b.weekday_tinyint, b.start_time);
    if (offA !== offB) return offA - offB;
    return a.start_time.localeCompare(b.start_time);
  });
}

export type Platform = 'web' | 'ios' | 'android';

export function getPlatform(): Platform {
  if (typeof window === 'undefined') return 'web';
  const ua = window.navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)) return 'ios';
  return 'web';
}

const CONFERENCE_PROVIDERS: Record<string, string> = {
  'bluejeans.com': 'Bluejeans',
  'discord.gg': 'Discord',
  'freeconference.com': 'Free Conference',
  'freeconferencecall.com': 'FreeConferenceCall',
  'goto.com': 'GoTo',
  'gotomeet.me': 'GoTo',
  'gotomeeting.com': 'GoTo',
  'horizon.meta.com': 'Virtual Reality',
  'maps.secondlife.com': 'Virtual Reality',
  'meet.google.com': 'Google Meet',
  'meet.jit.si': 'Jitsi',
  'meetings.dialpad.com': 'Dialpad',
  'signal.group': 'Signal',
  'skype.com': 'Skype',
  'slurl.com': 'Virtual Reality',
  'teams.live.com': 'Teams',
  'teams.microsoft.com': 'Teams',
  'vrchat.com': 'Virtual Reality',
  'webex.com': 'WebEx',
  'zoho.com': 'Zoho',
  'zoom.us': 'Zoom'
};

export function getConferenceProvider(url: string): string | undefined {
  try {
    const hostname = new URL(url).hostname;
    const match = Object.keys(CONFERENCE_PROVIDERS).find((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    return match ? CONFERENCE_PROVIDERS[match] : undefined;
  } catch {
    return undefined;
  }
}

export function meetingSlug(meeting: { meeting_name: string; id_bigint: string }): string {
  const name = meeting.meeting_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${name || 'meeting'}-${meeting.id_bigint}`;
}

export function filterMeetings(meetings: ProcessedMeeting[], filters: FilterState): ProcessedMeeting[] {
  const { search, weekdays, venueTypes, timeOfDay, formatIds } = filters;
  let result = meetings;

  if (weekdays.length > 0) {
    result = result.filter((m) => weekdays.includes(m.weekday_tinyint));
  }
  if (venueTypes.length > 0) {
    result = result.filter((m) => (venueTypes.includes(VENUE_TYPE.IN_PERSON) && m.isInPerson) || (venueTypes.includes(VENUE_TYPE.VIRTUAL) && m.isVirtual));
  }
  if (timeOfDay.length > 0) {
    result = result.filter((m) => timeOfDay.includes(m.timeOfDay));
  }
  if (formatIds.length > 0) {
    result = result.filter((m) => m.resolvedFormats.some((f) => formatIds.includes(f.id)));
  }
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (m) =>
        m.meeting_name.toLowerCase().includes(q) ||
        m.formattedAddress.toLowerCase().includes(q) ||
        m.location_municipality?.toLowerCase().includes(q) ||
        m.location_text?.toLowerCase().includes(q) ||
        m.comments?.toLowerCase().includes(q)
    );
  }

  return result;
}

export function getGeoErrorMessage(code: number, t: { locationDenied: string; locationUnavailable: string; locationTimeout: string; locationError: string }): string {
  if (code === 1) return t.locationDenied;
  if (code === 2) return t.locationUnavailable;
  if (code === 3) return t.locationTimeout;
  return t.locationError;
}

export function getDirectionsUrl(meeting: Meeting): string {
  const lat = meeting.latitude;
  const lng = meeting.longitude;
  const addr = encodeURIComponent(formatAddress(meeting));
  const platform = getPlatform();
  if (platform === 'ios') {
    return lat && lng ? `maps://?daddr=${lat},${lng}` : `maps://?q=${addr}`;
  } else if (platform === 'android') {
    return lat && lng ? `geo:${lat},${lng}?q=${lat},${lng}` : `geo:0,0?q=${addr}`;
  }
  return lat && lng ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : `https://www.google.com/maps/dir/?api=1&destination=${addr}`;
}
