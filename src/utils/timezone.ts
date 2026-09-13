// Timezone conversion for the virtual-meeting finder.
//
// BMLT returns each meeting's schedule in its OWN local zone (`weekday_tinyint`
// + `start_time` + `time_zone`). For a worldwide virtual list we want to show
// the viewer their own local weekday/time and order "starting soonest", so we
// compute each meeting's next upcoming occurrence as an absolute instant and
// re-express it in the viewer's zone. This mirrors ketchupsearch/vms.html's
// client-side `auto_tz_adjust`, and works on any server (the aggregator's
// server-side `sort_results_by_next_start`/`target_time_zone` only help the
// aggregator — we don't depend on them for correctness).

// BMLT weekday_tinyint: 1 = Sunday … 7 = Saturday.
const DOW_TO_BMLT: Record<string, number> = { Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6, Sat: 7 };

interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  weekday: number; // 1=Sun … 7=Sat
}

// The wall-clock calendar parts of `date` as observed in `zone`.
function zonedParts(date: Date, zone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: DOW_TO_BMLT[map.weekday ?? ''] ?? 1
  };
}

// The wall-clock time-of-day of `date` in `zone`, as 'HH:MM:SS'.
function zonedTimeOfDay(date: Date, zone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: zone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  // Some engines emit '24' for midnight.
  const hour = map.hour === '24' ? '00' : (map.hour ?? '00');
  return `${hour}:${map.minute ?? '00'}:${map.second ?? '00'}`;
}

// Offset (ms) of `zone` from UTC at the instant `date`. Positive east of UTC.
function zoneOffsetMs(date: Date, zone: string): number {
  const p = zonedParts(date, zone);
  const [h = '0', m = '0', s = '0'] = zonedTimeOfDay(date, zone).split(':');
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, Number(h), Number(m), Number(s));
  // Compare at second resolution so sub-second noise doesn't leak into the offset.
  return asUTC - (date.getTime() - date.getMilliseconds());
}

// Add `days` calendar days to a Y/M/D triple (pure date arithmetic — no DST).
function shiftYmd(year: number, month: number, day: number, days: number): { year: number; month: number; day: number } {
  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + days);
  return { year: base.getUTCFullYear(), month: base.getUTCMonth() + 1, day: base.getUTCDate() };
}

// The absolute instant for a wall-clock (Y/M/D H:M) interpreted in `zone`,
// accounting for the zone's UTC offset (including DST) at that moment.
function zonedWallToInstant(year: number, month: number, day: number, hour: number, minute: number, zone: string): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const off1 = zoneOffsetMs(new Date(utcGuess), zone);
  let instant = utcGuess - off1;
  // Refine once in case the guess landed on the wrong side of a DST transition.
  const off2 = zoneOffsetMs(new Date(instant), zone);
  if (off2 !== off1) instant = utcGuess - off2;
  return new Date(instant);
}

/**
 * The next upcoming occurrence (as an absolute instant) of a weekly meeting
 * that meets on `weekday` (1=Sun…7=Sat) at `startTime` ('HH:MM' or 'HH:MM:SS')
 * in IANA `zone`. Returns `null` if the inputs can't be parsed.
 *
 * @param from reference "now" (defaults to the current time); the result is the
 *   first occurrence strictly at or after this instant.
 */
export function nextOccurrence(weekday: number, startTime: string, zone: string, from: Date = new Date()): Date | null {
  const [hStr = '', mStr = ''] = startTime.split(':');
  const hour = Number(hStr);
  const minute = Number(mStr);
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || weekday < 1 || weekday > 7) return null;

  const now = zonedParts(from, zone);
  const dayDelta = (weekday - now.weekday + 7) % 7;

  const build = (extraDays: number): Date => {
    const { year, month, day } = shiftYmd(now.year, now.month, now.day, dayDelta + extraDays);
    return zonedWallToInstant(year, month, day, hour, minute, zone);
  };

  let candidate = build(0);
  if (candidate.getTime() < from.getTime()) candidate = build(7);
  return candidate;
}

export interface LocalSchedule {
  /** The meeting's next start re-expressed in the viewer's zone. */
  instant: Date;
  /** Weekday in the viewer's zone (1=Sun…7=Sat). */
  weekday: number;
  /** Start time-of-day in the viewer's zone, 'HH:MM:SS'. */
  startTime: string;
}

/**
 * Re-express a meeting's weekly schedule in the viewer's zone. Computes the next
 * occurrence in `sourceZone`, then reads back its weekday + time-of-day in
 * `viewerZone`. Returns `null` when the schedule can't be parsed.
 */
export function toViewerSchedule(weekday: number, startTime: string, sourceZone: string, viewerZone: string, from: Date = new Date()): LocalSchedule | null {
  const instant = nextOccurrence(weekday, startTime, sourceZone, from);
  if (!instant) return null;
  return {
    instant,
    weekday: zonedParts(instant, viewerZone).weekday,
    startTime: zonedTimeOfDay(instant, viewerZone)
  };
}

/** The viewer's IANA time zone (e.g. 'America/New_York'), or 'UTC' if unavailable. */
export function viewerTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}
