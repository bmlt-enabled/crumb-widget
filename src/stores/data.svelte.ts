import { SvelteMap } from 'svelte/reactivity';
import { BmltClient, Language } from 'bmlt-query-client';
import type { Meeting, Format, MeetingsWithFormats } from 'bmlt-query-client';
import { VENUE_TYPE } from '@/types';
import type { ProcessedMeeting } from '@/types';
import { formatTime, formatAddress, getTimeOfDay, sortMeetings } from '@utils/format';
import { config } from '@stores/config.svelte';
import { getLanguage } from '@stores/localization';

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
// `service_body_name` is deliberately absent: root servers reject it as a
// data_field_key (it is a joined value from the service body relation, not a
// meeting column, so it is missing from Meeting::$mainFields and from the
// whitelist in MeetingResource). Requesting it is silently ignored, so the name
// is resolved client-side from service_body_bigint instead — see
// resolveServiceBodyNames below.
const MEETING_DATA_FIELDS = [
  'id_bigint',
  'meeting_name',
  'weekday_tinyint',
  'start_time',
  'duration_time',
  'time_zone',
  'venue_type',
  'service_body_bigint',
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

function processMeetings(meetingsResp: Meeting[]): ProcessedMeeting[] {
  return meetingsResp.map((m) => {
    const weekday = Number(m.weekday_tinyint);
    const venueType = Number(m.venue_type);
    const formatIds = m.format_shared_id_list ? m.format_shared_id_list.split(',') : [];
    const resolvedFormats = formatIds.map((id) => dataState.formats.get(id.trim())).filter(Boolean) as Format[];
    return {
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

async function load(serverUrl: string, params: SearchParams): Promise<void> {
  if (!serverUrl) {
    dataState.error = 'No server URL configured. Add data-server to your embed element.';
    return;
  }

  dataState.loading = true;
  dataState.error = null;

  try {
    const client = new BmltClient({ serverURL: serverUrl });
    const langEnum = bmltLanguageFor(getLanguage());

    let meetingsResp: Meeting[];
    let formatsResp: Format[];

    if (config.query) {
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
      const withFormatLock = config.formatIds.length > 0 ? { ...params, formats: config.formatIds } : params;
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

    const formatsMap = new SvelteMap<string, Format>();
    for (const fmt of formatsResp) formatsMap.set(fmt.id, fmt);
    dataState.formats = formatsMap;

    await resolveServiceBodyNames(client, meetingsResp);

    const processed = applyFormatKeyLock(processMeetings(meetingsResp), config.formatKeys);
    dataState.meetings = sortMeetings(processed, config.nowOffset);
  } catch (err) {
    dataState.error = err instanceof Error ? err.message : 'Failed to load meetings.';
  } finally {
    dataState.loading = false;
  }
}

export function loadData(serverUrl: string, serviceBodyIds: number[] = []): Promise<void> {
  return load(serverUrl, serviceBodyIds.length > 0 ? { services: serviceBodyIds, recursive: true } : {});
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
    dataState.error = 'No server URL configured. Add data-server to your embed element.';
    return null;
  }
  const trimmed = address.trim();
  if (!trimmed) return null;

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
    dataState.error = err instanceof Error ? err.message : 'Could not find that location.';
    dataState.loading = false;
    return null;
  }

  await loadDataByCoordinates(serverUrl, coords.latitude, coords.longitude, geoWidth);
  return { lat: coords.latitude, lng: coords.longitude, displayName };
}
