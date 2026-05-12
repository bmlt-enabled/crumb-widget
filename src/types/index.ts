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
  formatIds: number[];
  formatKeys: string[];
  view: 'list' | 'map' | 'both';
  containerId: string;
  locationMarker?: MarkerConfig;
  tiles?: TilesConfig;
  tilesDark?: TilesConfig;
  columns: Column[];
  geolocation: boolean;
  geolocationRadius: number;
  distanceOptions: number[];
  distanceUnit: 'mi' | 'km';
  height?: number;
  darkMode?: 'auto' | true | false;
  nowOffset?: number;
  hideHeader?: boolean;
  updateUrl?: string;
  query?: string;
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

export type ViewType = 'list' | 'map' | 'both';

export type Column = 'time' | 'distance' | 'name' | 'location' | 'address' | 'service_body';

export interface TilesConfig {
  url: string;
  attribution: string;
}

export interface CrumbWidgetConfig {
  language?: string;
  view?: 'list' | 'map' | 'both';
  columns?: Column[];
  /** Show Near Me + typed location search (city/zip via Nominatim). Defaults to true on the unconstrained aggregator. */
  geolocation?: boolean;
  /** Positive = fixed radius in miles/km. Negative integer = BMLT auto-radius: find roughly N nearby meetings. */
  geolocationRadius?: number;
  distanceOptions?: number[];
  distanceUnit?: 'mi' | 'km';
  height?: number;
  darkMode?: 'auto' | true | false;
  nowOffset?: number;
  hideHeader?: boolean;
  /** Format key strings (e.g. ['O', 'BT']) to lock the widget to. Filtered client-side after fetch. */
  formats?: string[];
  /** Base path for History API routing (e.g. '/meetings'). Enables clean URLs without '#'. */
  basePath?: string;
  /**
   * URL template for the "Update meeting info" link shown at the bottom of the meeting detail
   * panel. Supports tokens `{meeting_id}`, `{meeting_name}`, `{server_url}`, `{return_url}`
   * (all URL-encoded on substitution). Works with bmlt-workflow's `?meeting_id=` form,
   * arbitrary hosted forms, or `mailto:` URLs. When unset, the button is hidden.
   *
   * @example "https://example.org/meeting-update/?meeting_id={meeting_id}"
   * @example "mailto:webservant@example.org?subject=Update%20for%20{meeting_name}&body=Meeting%20ID%3A%20{meeting_id}"
   */
  updateUrl?: string;
  /**
   * Raw BMLT query string passed through to `client.rawQuery()` (e.g. `"meeting_key=location_nation&meeting_key_value[]=USA"`).
   * Replaces the default service-body-based load entirely. When set, geolocation is forced off —
   * "Near Me", typed-location search, and "Search this area" are all disabled to avoid layering
   * `lat_val`/`long_val`/`geo_width` on top of the custom query. `get_used_formats=1` is appended
   * automatically if not present so meetings + formats come back in a single request.
   */
  query?: string;
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
