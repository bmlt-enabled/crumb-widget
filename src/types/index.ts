import type { Meeting, Format } from 'bmlt-query-client';

export type { Meeting, Format };

export interface AppConfig {
  rootServerUrl: string;
  serviceBodyIds: number[];
  defaultView: 'list' | 'map';
  containerId: string;
}

export interface ProcessedMeeting extends Meeting {
  formattedTime: string;
  formattedAddress: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayName: string;
  dayShort: string;
  resolvedFormats: Format[];
  isVirtual: boolean;
  isInPerson: boolean;
  isHybrid: boolean;
}

export interface FilterState {
  search: string;
  weekdays: number[];
  venueTypes: number[];
  timeOfDay: string[];
  formatIds: string[];
}

export type ViewType = 'list' | 'map' | 'detail';

export interface BmltMeetingListGlobalConfig {
  language?: string;
  defaultView?: 'list' | 'map';
}

declare global {
  interface Window {
    BmltMeetingListConfig?: BmltMeetingListGlobalConfig;
  }
}
