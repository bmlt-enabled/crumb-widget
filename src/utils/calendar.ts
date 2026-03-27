import type { ProcessedMeeting } from '@/types';
import { getPlatform } from './format';

// BMLT weekday_tinyint 1=Sun…7=Sat → iCal/Google BYDAY abbreviation
const BYDAY = ['', 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** YYYYMMDDTHHmmss — local wall-clock time (no Z) */
function formatLocal(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

/** YYYYMMDDTHHmmssZ — UTC, used for DTSTAMP */
function formatUtc(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

/**
 * Return a Date for the next occurrence of this meeting.
 * The Date is constructed in the user's local timezone.
 * BMLT start_time is treated as the meeting's wall-clock time; the meeting's
 * time_zone (if present) is passed to the calendar app via TZID / ctz so it
 * can display the event correctly regardless of the viewer's locale.
 */
function getNextOccurrence(meeting: ProcessedMeeting): { start: Date; end: Date } {
  const now = new Date();
  // BMLT weekday_tinyint 1=Sun…7=Sat, JS getDay() 0=Sun…6=Sat
  const targetJs = meeting.weekday_tinyint - 1;
  const daysUntil = (targetJs - now.getDay() + 7) % 7;

  const [h, m] = meeting.start_time.split(':').map(Number);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntil, h, m, 0, 0);

  // Same-day meeting that has already started → push one week out
  if (start <= now) {
    start.setDate(start.getDate() + 7);
  }

  const [dh, dm] = (meeting.duration_time || '01:00:00').split(':').map(Number);
  const end = new Date(start.getTime() + (dh * 60 + dm) * 60 * 1000);

  return { start, end };
}

export function formatGoogleCalendarUrl(meeting: ProcessedMeeting): string {
  const { start, end } = getNextOccurrence(meeting);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meeting.meeting_name,
    dates: `${formatLocal(start)}/${formatLocal(end)}`,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[meeting.weekday_tinyint]}`
  });

  if (meeting.time_zone) {
    params.set('ctz', meeting.time_zone);
  }

  if (meeting.isInPerson && meeting.formattedAddress) {
    params.set('location', [meeting.location_text, meeting.formattedAddress].filter(Boolean).join(', '));
  } else if (meeting.virtual_meeting_link) {
    params.set('location', meeting.virtual_meeting_link);
  }

  const desc: string[] = [];
  if (meeting.comments) desc.push(meeting.comments);
  if (meeting.isVirtual) {
    if (meeting.virtual_meeting_additional_info) desc.push(meeting.virtual_meeting_additional_info);
    if (meeting.virtual_meeting_link) desc.push(`Join: ${meeting.virtual_meeting_link}`);
  }
  if (desc.length) params.set('details', desc.join('\n\n'));

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcs(meeting: ProcessedMeeting): void {
  const { start, end } = getNextOccurrence(meeting);
  const tzid = meeting.time_zone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//bmlt-client//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${meeting.meeting_name}`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART;TZID=${tzid}:${formatLocal(start)}`,
    `DTEND;TZID=${tzid}:${formatLocal(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[meeting.weekday_tinyint]}`
  ];

  if (meeting.isInPerson && meeting.formattedAddress) {
    const loc = [meeting.location_text, meeting.formattedAddress].filter(Boolean).join(', ');
    lines.push(`LOCATION:${loc.replace(/,/g, '\\,')}`);
  }

  const desc: string[] = [];
  if (meeting.comments) desc.push(meeting.comments);
  if (meeting.isVirtual) {
    if (meeting.virtual_meeting_additional_info) desc.push(meeting.virtual_meeting_additional_info);
    if (meeting.virtual_meeting_link) desc.push(`Join: ${meeting.virtual_meeting_link}`);
  }
  if (desc.length) {
    lines.push(`DESCRIPTION:${desc.join('\\n').replace(/,/g, '\\,')}`);
  }

  lines.push('END:VEVENT', 'END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });

  if (getPlatform() === 'ios') {
    // iOS can't use createObjectURL for calendar files; data URI works
    const reader = new FileReader();
    reader.onload = () => {
      window.location.href = reader.result as string;
    };
    reader.readAsDataURL(blob);
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.meeting_name}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
