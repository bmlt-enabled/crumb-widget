import type { Meeting, Format } from 'bmlt-query-client';

export type { Meeting, Format };

/**
 * Configuration for a custom Leaflet marker. Used for the "your location" pin
 * when geolocation is active. The icon is rendered via `L.divIcon`, so `html`
 * may be any HTML string (typically an inline SVG).
 */
export interface MarkerConfig {
  /** Raw HTML inserted into the Leaflet `divIcon` (typically an inline `<svg>`). */
  html: string;
  /** Marker width in pixels. Used for `iconSize` and to compute the anchor. */
  width: number;
  /** Marker height in pixels. Used for `iconSize` and to compute the anchor. */
  height: number;
}

/**
 * Internal application config — the resolved, validated shape after merging
 * `data-*` attributes, `window.CrumbWidgetConfig`, and library-mode options.
 * Consumers of the public API should use {@link CrumbWidgetConfig} instead.
 *
 * @internal
 */
export interface AppConfig {
  /** BMLT root server URL (e.g. `https://bmlt.example.org/main_server/`). */
  serverUrl: string;
  /** Service body IDs to filter by. Empty array means "all". */
  serviceBodyIds: number[];
  /** Format IDs (numeric) to filter by. Server-side filter. */
  formatIds: number[];
  /** Format keys (e.g. `['O', 'BT']`) to filter by client-side after fetch. */
  formatKeys: string[];
  /** Active view — list-only, map-only, or both side-by-side. */
  view: 'list' | 'map' | 'both';
  /** DOM id of the widget container element. */
  containerId: string;
  /** Optional custom marker for the user's location. */
  locationMarker?: MarkerConfig;
  /** Optional override for the light-mode map tile layer. */
  tiles?: TilesConfig;
  /** Optional override for the dark-mode map tile layer. */
  tilesDark?: TilesConfig;
  /** Columns to show in the meeting list (order matters). */
  columns: Column[];
  /** Whether to show "Near Me" + typed-location search. */
  geolocation: boolean;
  /** Fixed radius (positive) or BMLT auto-radius (negative integer). */
  geolocationRadius: number;
  /** Distance options offered in the distance filter dropdown. */
  distanceOptions: number[];
  /** Units used for distance display. */
  distanceUnit: 'mi' | 'km';
  /** Optional fixed widget height in pixels. */
  height?: number;
  /** Dark-mode strategy: `'auto'` follows the OS, `true`/`false` forces. */
  darkMode?: 'auto' | true | false;
  /** Offset in minutes added to the current time for "happening now" logic. */
  nowOffset?: number;
  /** Hide the header bar at the top of the widget. */
  hideHeader?: boolean;
  /** Show a comma-separated list of format codes (`key_string`) beneath each meeting name in the list/cards. */
  showFormats: boolean;
  /**
   * Format key strings (e.g. `['M', 'W']`) to highlight inline next to each meeting name.
   * Matching formats render their localized `name_string` as a muted suffix. Empty means none.
   */
  inlineFormats: string[];
  /** Template URL for the "Update meeting info" link (see {@link CrumbWidgetConfig.updateUrl}). */
  updateUrl?: string;
  /** Raw BMLT query string passed through to `client.rawQuery()` verbatim. */
  query?: string;
}

/**
 * A {@link Meeting} enriched with display-ready fields computed at load time.
 * The raw API record is preserved on the object — the extra fields are added
 * alongside so components can render without re-running format/sort logic.
 *
 * @internal
 */
export interface ProcessedMeeting extends Meeting {
  /** Localized start time, e.g. `"7:00 PM"`. */
  formattedTime: string;
  /** Single-line address string assembled from BMLT address fields. */
  formattedAddress: string;
  /** Coarse time-of-day bucket — used by the time-of-day filter chips. */
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  /** Resolved {@link Format} objects (BMLT returns only IDs in the meeting record). */
  resolvedFormats: Format[];
  /** True for `venue_type` 2 (Virtual) or 3 (Hybrid). */
  isVirtual: boolean;
  /** True for `venue_type` 1 (In-Person) or 3 (Hybrid). */
  isInPerson: boolean;
}

/**
 * The set of active filters applied to the meeting list. Mutated by the
 * Controls component; consumed by App.svelte's `filteredMeetings` derivation.
 *
 * @internal
 */
export interface FilterState {
  /** Free-text search term (matched against name, location, address). */
  search: string;
  /** Selected weekdays as BMLT `weekday_tinyint` values (1=Sun … 7=Sat). */
  weekdays: number[];
  /** Selected venue types — see {@link VENUE_TYPE}. */
  venueTypes: number[];
  /** Selected time-of-day buckets (`'morning' | 'afternoon' | 'evening' | 'night'`). */
  timeOfDay: string[];
  /** Selected format IDs (stored as strings to match BMLT's serialization). */
  formatIds: string[];
  /** Selected service body display names. */
  serviceBodyNames: string[];
}

/**
 * Numeric `venue_type` values used by the BMLT API.
 *
 * | Value | Meaning   |
 * | ----- | --------- |
 * | `1`   | In-Person |
 * | `2`   | Virtual   |
 * | `3`   | Hybrid    |
 *
 * The BMLT API returns these as **strings** — always coerce with `Number()`
 * before comparing.
 */
export const VENUE_TYPE = {
  IN_PERSON: 1,
  VIRTUAL: 2,
  HYBRID: 3
} as const;

/** Available view modes for the widget. */
export type ViewType = 'list' | 'map' | 'both';

/** Available columns for the meeting list table. */
export type Column = 'time' | 'distance' | 'name' | 'location' | 'address' | 'service_body' | 'formats';

/**
 * A Leaflet tile-layer override. Use this to swap the default OpenStreetMap
 * tiles for a custom provider (Mapbox, Stadia Maps, self-hosted, etc.).
 */
export interface TilesConfig {
  /** Tile URL template, e.g. `"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"`. */
  url: string;
  /** Attribution HTML shown in the map's bottom-right corner. */
  attribution: string;
}

/**
 * Public configuration shape for the widget. Used in two places:
 *
 * 1. As the global `window.CrumbWidgetConfig` object for the IIFE/CDN bundle.
 * 2. As the second argument to {@link mountCrumbWidget} for the ESM library
 *    bundle (extended by `MountOptions` with `serverUrl` and `serviceBodyIds`).
 *
 * Every field is optional — unset fields fall back to the widget's defaults
 * (and, for `language` / `distanceUnit`, to values derived from
 * `navigator.language`).
 */
export interface CrumbWidgetConfig {
  /**
   * BCP-47 language tag (e.g. `"en"`, `"pt-BR"`). When unset, the widget reads
   * `navigator.language`. Unsupported tags fall back to English silently.
   */
  language?: string;
  /** Which view to render initially. Defaults to `'list'`. */
  view?: 'list' | 'map' | 'both';
  /** Columns to show in the meeting list (order matters). */
  columns?: Column[];
  /** Show Near Me + typed location search (city/zip via Nominatim). Defaults to true on the unconstrained aggregator. */
  geolocation?: boolean;
  /** Positive = fixed radius in miles/km. Negative integer = BMLT auto-radius: find roughly N nearby meetings. */
  geolocationRadius?: number;
  /** Values shown in the distance filter dropdown (in `distanceUnit`). */
  distanceOptions?: number[];
  /**
   * Units used for distance display. When unset, the widget derives it from
   * the resolved locale — US/UK/Liberia/Myanmar use miles; everywhere else
   * uses kilometers.
   */
  distanceUnit?: 'mi' | 'km';
  /** Fixed widget height in pixels. When unset, the widget grows to fit content. */
  height?: number;
  /**
   * Dark-mode strategy:
   * - `'auto'` — follow `prefers-color-scheme`
   * - `true` — force dark
   * - `false` — force light (default)
   */
  darkMode?: 'auto' | true | false;
  /**
   * Offset in minutes added to the current time when computing "happening now"
   * highlighting. Defaults to `10` — meetings starting in the next 10 minutes
   * are flagged as starting soon.
   */
  nowOffset?: number;
  /** Hide the header bar at the top of the widget. */
  hideHeader?: boolean;
  /**
   * Show a comma-separated list of format codes (`key_string`, e.g. `"O, BT, D"`) beneath each
   * meeting name in the list/cards view. Defaults to `false`.
   */
  showFormats?: boolean;
  /** Format key strings (e.g. ['O', 'BT']) to lock the widget to. Filtered client-side after fetch. */
  formats?: string[];
  /**
   * Format key strings (e.g. `['M', 'W']`) to highlight inline next to each meeting name in the
   * list/cards view. Matching formats render their localized name (e.g. "Men", "Women") as a muted
   * suffix — a curated highlight for special-interest meetings, independent of `showFormats`.
   * BMLT format key strings vary by server, so this is opt-in: defaults to `[]` (none), and a
   * configured code only shows where the server actually uses it. Equivalent to the
   * `data-inline-formats` attribute (the attribute takes precedence).
   */
  inlineFormats?: string[];
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
  /** Map-related overrides (tile layers, custom markers). */
  map?: {
    /** Light-mode tile layer override. */
    tiles?: TilesConfig;
    /** Dark-mode tile layer override. */
    tiles_dark?: TilesConfig;
    /** Custom marker icons. */
    markers?: {
      /** Marker used for the user's geolocated position. */
      location?: MarkerConfig;
    };
  };
}

declare global {
  interface Window {
    /**
     * Global configuration object read by the IIFE/CDN bundle. Must be defined
     * **before** `app.js` is loaded — the bundle reads it once on startup.
     */
    CrumbWidgetConfig?: CrumbWidgetConfig;
  }
}
