import { SvelteMap } from 'svelte/reactivity';
import { BmltClient } from 'bmlt-query-client';
import type { Meeting, Format } from 'bmlt-query-client';
import type { ProcessedMeeting } from '@/types';
import { formatTime, formatAddress, getTimeOfDay, sortMeetings } from '@utils/format';

const PAGE_SIZE = 5000;

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
      isInPerson: venueType === 1 || venueType === 3,
      isVirtual: venueType === 2 || venueType === 3
    };
  });
}

export async function loadData(rootServerUrl: string, serviceBodyIds: number[] = []): Promise<void> {
  if (!rootServerUrl) {
    dataState.error = 'No root server URL configured. Add data-root-server to your embed element.';
    return;
  }

  dataState.loading = true;
  dataState.error = null;

  try {
    const client = new BmltClient({ rootServerURL: rootServerUrl });

    const { meetings: meetingsResp, formats: formatsResp } = await client.searchMeetingsWithFormats({
      ...(serviceBodyIds.length > 0 ? { services: serviceBodyIds, recursive: true } : {}),
      page_size: PAGE_SIZE
    });

    const formatsMap = new SvelteMap<string, Format>();
    for (const fmt of formatsResp) {
      formatsMap.set(fmt.id, fmt);
    }
    dataState.formats = formatsMap;

    dataState.meetings = sortMeetings(processMeetings(meetingsResp));
  } catch (err) {
    dataState.error = err instanceof Error ? err.message : 'Failed to load meetings.';
  } finally {
    dataState.loading = false;
  }
}

export async function loadDataByCoordinates(rootServerUrl: string, latitude: number, longitude: number, radiusMiles: number = 10): Promise<void> {
  if (!rootServerUrl) {
    dataState.error = 'No root server URL configured. Add data-root-server to your embed element.';
    return;
  }

  dataState.loading = true;
  dataState.error = null;

  try {
    const client = new BmltClient({ rootServerURL: rootServerUrl });

    const { meetings: meetingsResp, formats: formatsResp } = await client.searchMeetingsWithFormats({
      lat_val: latitude,
      long_val: longitude,
      geo_width: radiusMiles,
      sort_results_by_distance: true,
      page_size: PAGE_SIZE
    });

    const formatsMap = new SvelteMap<string, Format>();
    for (const fmt of formatsResp) formatsMap.set(fmt.id, fmt);
    dataState.formats = formatsMap;

    dataState.meetings = sortMeetings(processMeetings(meetingsResp));
  } catch (err) {
    dataState.error = err instanceof Error ? err.message : 'Failed to load meetings.';
  } finally {
    dataState.loading = false;
  }
}
