import type { Meeting, Format } from 'bmlt-query-client';

export type { Meeting, Format };

export interface MarkerConfig {
  html: string;
  width: number;
  height: number;
}

export interface AppConfig {
  serverUrl: string;
  serviceBodyIds: number[];
  defaultView: 'list' | 'map';
  containerId: string;
  locationMarker?: MarkerConfig;
  tiles?: TilesConfig;
  tilesDark?: TilesConfig;
  columns: Column[];
  geolocation: boolean;
  geolocationRadius: number;
  height?: number;
  darkMode?: 'auto' | true | false;
  nowOffset?: number;
  hideHeader?: boolean;
}

export interface ProcessedMeeting extends Meeting {
  formattedTime: string;
  formattedAddress: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
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
  serviceBodyNames: string[];
}

export const VENUE_TYPE = {
  IN_PERSON: 1,
  VIRTUAL: 2,
  HYBRID: 3
} as const;

export type ViewType = 'list' | 'map';

export type Column = 'time' | 'name' | 'location' | 'address' | 'service_body';

export interface TilesConfig {
  url: string;
  attribution: string;
}

export interface CrumbWidgetConfig {
  language?: string;
  defaultView?: 'list' | 'map';
  columns?: Column[];
  geolocation?: boolean;
  geolocationRadius?: number;
  height?: number;
  darkMode?: 'auto' | true | false;
  nowOffset?: number;
  hideHeader?: boolean;
  /** Base path for History API routing (e.g. '/meetings'). Enables clean URLs without '#'. */
  basePath?: string;
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
    CrumbWidgetConfig?: CrumbWidgetConfig;
  }
}
