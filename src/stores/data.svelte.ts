import { SvelteMap } from 'svelte/reactivity';
import { BmltClient, Language } from 'bmlt-query-client';
import type { Meeting, Format } from 'bmlt-query-client';
import { VENUE_TYPE } from '@/types';
import type { ProcessedMeeting } from '@/types';
import { formatTime, formatAddress, getTimeOfDay, sortMeetings } from '@utils/format';
import { config } from '@stores/config.svelte';
import { getLanguage } from '@stores/localization';

const PAGE_SIZE = 5000;

type SearchParams = Parameters<BmltClient['searchMeetingsWithFormats']>[0];

const BMLT_LANGS = new Set<string>(Object.values(Language));

function bmltLanguageFor(widgetLang: string): Language | undefined {
  const base = (widgetLang.split('-')[0] ?? '').toLowerCase();
  return BMLT_LANGS.has(base) ? (base as Language) : undefined;
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

function applyFormatKeyLock(meetings: ProcessedMeeting[], formatKeys: string[]): ProcessedMeeting[] {
  if (formatKeys.length === 0) return meetings;
  const wanted = formatKeys.map((k) => k.toLowerCase());
  return meetings.filter((m) => {
    const have = new Set(m.resolvedFormats.map((f) => f.key_string.toLowerCase()));
    return wanted.every((k) => have.has(k));
  });
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
    const lang_enum = bmltLanguageFor(getLanguage());
    const withFormatLock = config.formatIds.length > 0 ? { ...params, formats: config.formatIds } : params;
    const baseParams = { ...withFormatLock, page_size: PAGE_SIZE };
    let { meetings: meetingsResp, formats: formatsResp } = await client.searchMeetingsWithFormats(lang_enum ? { ...baseParams, lang_enum } : baseParams);

    // If the server has no translations for the requested language it returns
    // an empty formats array AND strips format_shared_id_list from every
    // meeting. Retry once without lang_enum so meetings come back with format
    // references and English format names.
    if (lang_enum && lang_enum !== Language.ENGLISH && formatsResp.length === 0 && meetingsResp.length > 0) {
      ({ meetings: meetingsResp, formats: formatsResp } = await client.searchMeetingsWithFormats(baseParams));
    }

    const formatsMap = new SvelteMap<string, Format>();
    for (const fmt of formatsResp) formatsMap.set(fmt.id, fmt);
    dataState.formats = formatsMap;

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

export function loadDataByCoordinates(serverUrl: string, latitude: number, longitude: number, radiusMiles: number = 10): Promise<void> {
  return load(serverUrl, {
    lat_val: latitude,
    long_val: longitude,
    geo_width: radiusMiles,
    sort_results_by_distance: true
  });
}
