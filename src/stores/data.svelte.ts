import { get } from 'svelte/store';
import { SvelteMap } from 'svelte/reactivity';
import { BmltClient, Language, VenueType, Weekday } from 'bmlt-query-client';
import type { Meeting, Format, MeetingsWithFormats } from 'bmlt-query-client';
import { VENUE_TYPE } from '@/types';
import type { ProcessedMeeting } from '@/types';
import { formatTime, formatAddress, getTimeOfDay, sortMeetings } from '@utils/format';
import { toViewerSchedule, viewerTimeZone } from '@utils/timezone';
import { config } from '@stores/config.svelte';
import { getLanguage, t } from '@stores/localization';

const PAGE_SIZE = 5000;

// Restrict the GetSearchResults response to only the meeting fields the widget
// actually reads. The BMLT `json` handler otherwise returns all ~44 fields per
// meeting (admin notes, contact info, world IDs, etc.), roughly doubling the
// payload vs what we render. Keep this in sync with field reads across the
// components/utils — notably countUniqueGroups (service_body_bigint,
// virtual_meeting_link, virtual_meeting_additional_info, latitude, longitude),
// processMeetings (format_shared_id_list, venue_type), and formatAddress
// (location_* fields). The top-level `formats` array (get_used_formats) is
// unaffected by data_field_key.
//
// `service_body_name` is requested here: modern BMLT servers (and the aggregator)
// now return it inline as a data_field_key, so the name arrives with the meeting
// and no extra request is needed. Older servers that predate that fix silently
// omit it; for those, resolveServiceBodyNames() below still resolves the name
// client-side from service_body_bigint as a fallback (a no-op when the name is
// already present).
const MEETING_DATA_FIELDS = [
  'id_bigint',
  'meeting_name',
  'weekday_tinyint',
  'start_time',
  'duration_time',
  'time_zone',
  'venue_type',
  'service_body_bigint',
  'service_body_name',
  'latitude',
  'longitude',
  'distance_in_miles',
  'format_shared_id_list',
  'virtual_meeting_link',
  'virtual_meeting_additional_info',
  'location_text',
  'location_street',
  'location_municipality',
  'location_province',
  'location_postal_code_1',
  'location_info',
  'comments',
  'email_contact'
].join(',');

type SearchParams = Parameters<BmltClient['searchMeetingsWithFormats']>[0];

const BMLT_LANGS = new Set<string>(Object.values(Language));

function bmltLanguageFor(widgetLang: string): Language | undefined {
  const [base = ''] = widgetLang.split('-');
  const lower = base.toLowerCase();
  return BMLT_LANGS.has(lower) ? (lower as Language) : undefined;
}

interface DataState {
  meetings: ProcessedMeeting[];
  formats: SvelteMap<string, Format>;
  loading: boolean;
  error: string | null;
}

export const dataState = $state<DataState>({
  meetings: [],
  formats: new SvelteMap(),
  loading: false,
  error: null
});

// Monotonic token for in-flight searches: every search bumps it, and a
// response only writes to dataState when no newer search has started since —
// the latest *search* wins, not whichever response happens to land last.
let activeRequest = 0;

function processMeetings(meetingsResp: Meeting[]): ProcessedMeeting[] {
  // Virtual finder mode: re-express every meeting's schedule in the viewer's
  // zone so the worldwide list reads in local time and sorts soonest-first.
  const viewerZone = config.virtual ? viewerTimeZone() : '';
  return meetingsResp.map((m) => {
    const weekday = Number(m.weekday_tinyint);
    const venueType = Number(m.venue_type);
    const formatIds = m.format_shared_id_list ? m.format_shared_id_list.split(',') : [];
    const resolvedFormats = formatIds.map((id) => dataState.formats.get(id.trim())).filter(Boolean) as Format[];
    const base: ProcessedMeeting = {
      ...m,
      weekday_tinyint: weekday,
      venue_type: venueType,
      formattedTime: formatTime(m.start_time),
      formattedAddress: formatAddress(m),
      timeOfDay: getTimeOfDay(m.start_time),
      resolvedFormats,
      isInPerson: venueType === VENUE_TYPE.IN_PERSON || venueType === VENUE_TYPE.HYBRID,
      isVirtual: venueType === VENUE_TYPE.VIRTUAL || venueType === VENUE_TYPE.HYBRID
    };

    // Only convert in virtual mode, and only when we know the meeting's own zone
    // and it differs from the viewer's. Overwriting weekday/start_time/time_zone
    // lets the existing sort, day-grouping, and "in progress" logic all operate
    // in local terms; the originals are preserved for display beneath.
    const sourceZone = m.time_zone || '';
    if (!config.virtual || !sourceZone || sourceZone === viewerZone) return base;
    const local = toViewerSchedule(weekday, m.start_time, sourceZone, viewerZone);
    if (!local) return base;
    return {
      ...base,
      weekday_tinyint: local.weekday,
      start_time: local.startTime,
      formattedTime: formatTime(local.startTime),
      timeOfDay: getTimeOfDay(local.startTime),
      time_zone: viewerZone,
      localConverted: true,
      originalStartTime: m.start_time,
      originalWeekday: weekday,
      originalTimeZone: sourceZone
    };
  });
}

// Fill in service_body_name from a GetServiceBodies lookup for any meeting the
// server did not supply one for. Used by the service_body column, the meeting
// detail panel, and the service body filter. Best-effort: if the lookup fails
// the names stay empty, exactly as they would have been anyway.
async function resolveServiceBodyNames(client: BmltClient, meetings: Meeting[]): Promise<void> {
  if (meetings.length === 0 || meetings.every((m) => m.service_body_name)) return;

  // Ask only for the service bodies actually referenced by the result set —
  // unfiltered, GetServiceBodies returns every body on the server (115 on a
  // typical region, ~1600 on the aggregator) to resolve a handful of names.
  const wanted = [...new Set(meetings.filter((m) => !m.service_body_name).map((m) => Number(m.service_body_bigint)))].filter((id) => Number.isFinite(id) && id > 0);
  if (wanted.length === 0) return;

  let bodies: Awaited<ReturnType<BmltClient['getServiceBodies']>>;
  try {
    bodies = await client.getServiceBodies({ services: wanted });
  } catch {
    return;
  }

  const nameById = new Map(bodies.map((b) => [String(b.id), b.name]));
  for (const meeting of meetings) {
    if (meeting.service_body_name) continue;
    meeting.service_body_name = nameById.get(String(meeting.service_body_bigint)) ?? '';
  }
}

function applyFormatKeyLock(meetings: ProcessedMeeting[], formatKeys: string[]): ProcessedMeeting[] {
  if (formatKeys.length === 0) return meetings;
  const wanted = formatKeys.map((k) => k.toLowerCase());
  return meetings.filter((m) => {
    const have = new Set(m.resolvedFormats.map((f) => f.key_string.toLowerCase()));
    return wanted.every((k) => have.has(k));
  });
}

function buildRawQuery(base: string, extras: Record<string, string>): string {
  const existing = new Set(
    base
      .split('&')
      .map((kv) => kv.split('=')[0])
      .filter(Boolean)
  );
  const additions = Object.entries(extras)
    .filter(([k]) => !existing.has(k))
    .map(([k, v]) => `${k}=${v}`);
  return additions.length > 0 ? `${base}&${additions.join('&')}` : base;
}

async function load(serverUrl: string, params: SearchParams, opts: { byId?: boolean } = {}): Promise<void> {
  if (!serverUrl) {
    dataState.error = get(t).errorNoServer;
    return;
  }

  const request = ++activeRequest;
  dataState.loading = true;
  dataState.error = null;

  try {
    const client = new BmltClient({ serverURL: serverUrl });
    const langEnum = bmltLanguageFor(getLanguage());

    let meetingsResp: Meeting[];
    let formatsResp: Format[];

    // A by-id fetch (deep link to one meeting) ignores the embedder's raw query
    // and format locks — it must return exactly the requested meeting.
    if (config.query && !opts.byId) {
      // Raw query path: pass the embedder's query string through verbatim.
      // We append page_size + get_used_formats so meetings + formats still arrive
      // in a single round-trip, and langEnum to match the rest of the widget.
      const extras: Record<string, string> = {
        page_size: String(PAGE_SIZE),
        get_used_formats: '1'
      };
      if (langEnum) extras.lang_enum = langEnum;
      let resp = await client.rawQuery<MeetingsWithFormats>(buildRawQuery(config.query, extras));

      // Same lang-fallback as the structured path: a server with no translations
      // for the requested language returns empty formats and strips
      // format_shared_id_list from meetings. Retry once without langEnum.
      if (langEnum && langEnum !== Language.ENGLISH && resp.formats.length === 0 && resp.meetings.length > 0) {
        const { lang_enum: _omit, ...rest } = extras;
        resp = await client.rawQuery<MeetingsWithFormats>(buildRawQuery(config.query, rest));
      }
      meetingsResp = resp.meetings;
      formatsResp = resp.formats;
    } else {
      const withFormatLock = !opts.byId && config.formatIds.length > 0 ? { ...params, formats: config.formatIds } : params;
      const baseParams = { ...withFormatLock, page_size: PAGE_SIZE, data_field_key: MEETING_DATA_FIELDS };
      ({ meetings: meetingsResp, formats: formatsResp } = await client.searchMeetingsWithFormats(langEnum ? { ...baseParams, lang_enum: langEnum } : baseParams));

      // If the server has no translations for the requested language it returns
      // an empty formats array AND strips format_shared_id_list from every
      // meeting. Retry once without langEnum so meetings come back with format
      // references and English format names.
      if (langEnum && langEnum !== Language.ENGLISH && formatsResp.length === 0 && meetingsResp.length > 0) {
        ({ meetings: meetingsResp, formats: formatsResp } = await client.searchMeetingsWithFormats(baseParams));
      }
    }

    // Fallback for older servers that don't return service_body_name inline:
    // resolve any still-missing names from service_body_bigint. A no-op when the
    // server already supplied every name (modern servers and the aggregator).
    await resolveServiceBodyNames(client, meetingsResp);

    if (request !== activeRequest) return;

    const formatsMap = new SvelteMap<string, Format>();
    for (const fmt of formatsResp) formatsMap.set(fmt.id, fmt);
    dataState.formats = formatsMap;

    const processed = opts.byId ? processMeetings(meetingsResp) : applyFormatKeyLock(processMeetings(meetingsResp), config.formatKeys);
    dataState.meetings = sortMeetings(processed, config.nowOffset);
  } catch (err) {
    if (request === activeRequest) dataState.error = err instanceof Error ? err.message : get(t).errorLoadingMeetings;
  } finally {
    if (request === activeRequest) dataState.loading = false;
  }
}

export function loadData(serverUrl: string, serviceBodyIds: number[] = []): Promise<void> {
  return load(serverUrl, serviceBodyIds.length > 0 ? { services: serviceBodyIds, recursive: true } : {});
}

// Fetch a single meeting by id — used when a meeting detail page is opened
// directly (deep link) so we don't load the whole result set (or prompt for
// geolocation) just to show one meeting. The full set is loaded lazily only when
// the user navigates to the list ("Back to meetings"). Ignores service-body,
// format locks, geolocation, and the virtual day filter.
export function loadMeetingById(serverUrl: string, id: string | number): Promise<void> {
  const numId = Number(id);
  if (!Number.isFinite(numId) || numId <= 0) return Promise.resolve();
  return load(serverUrl, { meeting_ids: [numId] }, { byId: true });
}

// Session cache of already-loaded virtual days, keyed by weekday (1=Sun…7=Sat).
// The virtual finder loads one day at a time; caching lets you flip back to a day
// you've already viewed instantly, with no refetch. Session-only (not persisted);
// a page reload starts fresh. clearVirtualDayCache() drops it if inputs change.
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- plain lookup cache; results are copied into the reactive dataState, the cache itself is not rendered
const virtualDayCache = new Map<number, { meetings: ProcessedMeeting[]; formats: SvelteMap<string, Format> }>();
// Tracks the most recently requested virtual weekday so a superseded in-flight
// fetch never caches its (now stale) result under the wrong key.
let latestVirtualWeekday = 0;

export function clearVirtualDayCache(): void {
  virtualDayCache.clear();
}

// Virtual finder mode: virtual + hybrid meetings for a single weekday, ordered
// "starting soonest". Worldwide there are thousands of virtual meetings, so the
// finder loads one day at a time (default: today) rather than everything at once.
// On the aggregator the server buckets the day in the viewer's zone
// (target_time_zone) and orders soonest-first (sort_results_by_next_start);
// ordinary root servers ignore those and the client's local-time conversion +
// sort still produce a correct soonest-first list for that day.
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- transient read for the default weekday, not stored reactive state
export function loadVirtualData(serverUrl: string, serviceBodyIds: number[] = [], weekday: number = new Date().getDay() + 1): Promise<void> {
  latestVirtualWeekday = weekday;

  const cached = virtualDayCache.get(weekday);
  if (cached) {
    // Restore instantly. Bump the request token so any in-flight fetch for a
    // previously selected day can't overwrite the restored data when it lands.
    activeRequest++;
    dataState.error = null;
    dataState.loading = false;
    dataState.formats = cached.formats;
    // Re-sort against the current time so "starting soonest" stays fresh even if
    // the day was cached a while ago (isInProgress is recomputed at render).
    dataState.meetings = sortMeetings(cached.meetings, config.nowOffset);
    return Promise.resolve();
  }

  const params: SearchParams = {
    venue_types: [VenueType.VIRTUAL, VenueType.HYBRID],
    weekdays: [weekday as Weekday],
    sort_results_by_next_start: true,
    next_start_grace_minutes: 15,
    target_time_zone: viewerTimeZone()
  };
  if (serviceBodyIds.length > 0) {
    params.services = serviceBodyIds;
    params.recursive = true;
  }

  return load(serverUrl, params).then(() => {
    // Cache only a successful load that is still the selected day — guards against
    // a superseded fetch storing another day's data (now in dataState) under this key.
    if (!dataState.error && latestVirtualWeekday === weekday) {
      virtualDayCache.set(weekday, { meetings: dataState.meetings, formats: dataState.formats });
    }
  });
}

export function loadDataByCoordinates(serverUrl: string, latitude: number, longitude: number, geoWidth: number = 10): Promise<void> {
  return load(serverUrl, {
    lat_val: latitude,
    long_val: longitude,
    geo_width: geoWidth,
    sort_results_by_distance: true
  });
}

export interface GeocodedLocation {
  lat: number;
  lng: number;
  displayName: string;
}

export async function loadDataByAddress(serverUrl: string, address: string, geoWidth: number = 10): Promise<GeocodedLocation | null> {
  if (!serverUrl) {
    dataState.error = get(t).errorNoServer;
    return null;
  }
  const trimmed = address.trim();
  if (!trimmed) return null;

  const request = ++activeRequest;
  dataState.loading = true;
  dataState.error = null;

  let coords: { latitude: number; longitude: number };
  let displayName: string;
  try {
    const client = new BmltClient({ serverURL: serverUrl });
    const result = await client.geocodeAddress(trimmed);
    coords = result.coordinates;
    displayName = result.display_name;
  } catch (err) {
    if (request === activeRequest) {
      dataState.error = err instanceof Error ? err.message : get(t).locationNotFound;
      dataState.loading = false;
    }
    return null;
  }

  if (request !== activeRequest) return null;

  await loadDataByCoordinates(serverUrl, coords.latitude, coords.longitude, geoWidth);
  return { lat: coords.latitude, lng: coords.longitude, displayName };
}
