import type { Meeting, Format } from 'bmlt-query-client';

export type { Meeting, Format };

export interface MarkerConfig {
  html: string;
  width: number;
  height: number;
}

export interface AppConfig {
  rootServerUrl: string;
  serviceBodyIds: number[];
  defaultView: 'list' | 'map';
  containerId: string;
  locationMarker?: MarkerConfig;
  tiles?: TilesConfig;
  tilesDark?: TilesConfig;
  showCalendar: boolean;
  columns: Column[];
  geolocation: boolean;
  geolocationRadius: number;
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
}

export interface FilterState {
  search: string;
  weekdays: number[];
  venueTypes: number[];
  timeOfDay: string[];
  formatIds: string[];
}

export type ViewType = 'list' | 'map' | 'detail';

export type Column = 'time' | 'name' | 'location' | 'address' | 'service_body';

export interface TilesConfig {
  url: string;
  attribution: string;
}

export interface BmltMeetingListGlobalConfig {
  language?: string;
  defaultView?: 'list' | 'map';
  calendar?: boolean;
  columns?: Column[];
  geolocation?: boolean;
  geolocationRadius?: number;
  map?: {
    tiles?: TilesConfig;
    tiles_dark?: TilesConfig;
    markers?: {
      location?: MarkerConfig;
    };
  };
}

declare global {
  interface Window {
    BmltMeetingListConfig?: BmltMeetingListGlobalConfig;
  }
}
