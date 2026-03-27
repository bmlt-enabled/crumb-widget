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
  return [...meetings].sort((a, b) => {
    if (a.weekday_tinyint !== b.weekday_tinyint) return a.weekday_tinyint - b.weekday_tinyint;
    return a.start_time.localeCompare(b.start_time);
  });
}

export function getDirectionsUrl(meeting: Meeting): string {
  if (meeting.latitude && meeting.longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${meeting.latitude},${meeting.longitude}`;
  }
  const addr = formatAddress(meeting);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`;
}
