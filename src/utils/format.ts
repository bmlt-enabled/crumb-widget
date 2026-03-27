import type { Meeting } from '@/types/index';

export const WEEKDAYS = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAYS_SHORT = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function formatTime(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
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

export function sortMeetings<T extends { weekday_tinyint: number; start_time: string }>(meetings: T[]): T[] {
  // Rotate so today's weekday sorts first; BMLT weekday_tinyint is 1=Sun…7=Sat
  const today = new Date().getDay() + 1; // 1–7 matching BMLT
  const offset = (day: number) => (day - today + 7) % 7;
  return [...meetings].sort((a, b) => {
    const dayDiff = offset(a.weekday_tinyint) - offset(b.weekday_tinyint);
    if (dayDiff !== 0) return dayDiff;
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
