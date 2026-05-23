/**
 * Crumb Widget — embeddable NA meeting finder for BMLT root servers.
 *
 * This module is the ESM entry point for npm consumers. It exports
 * {@link mountCrumbWidget}, a single function that mounts the widget into a
 * host element, plus the public {@link CrumbWidgetConfig} configuration type.
 *
 * For drop-in HTML embeds (no bundler), use the prebuilt IIFE bundle
 * (`dist/app.js`) instead — it reads `data-*` attributes from a
 * `#crumb-widget` element and optionally a global `window.CrumbWidgetConfig`.
 *
 * @example Mount via ESM
 * ```ts
 * import { mountCrumbWidget } from 'crumb-widget';
 *
 * mountCrumbWidget(document.getElementById('my-widget')!, {
 *   serverUrl: 'https://bmlt.example.org/main_server/',
 *   serviceBodyIds: [1, 2, 3],
 *   view: 'both',
 *   distanceUnit: 'mi',
 * });
 * ```
 *
 * @packageDocumentation
 */

import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { config, CONFIG_DEFAULTS } from '@stores/config.svelte';
import { setHashMode } from '@bmlt-enabled/svelte-spa-router';
import { initLocalization, SUPPORTED_LANGUAGES } from '@stores/localization';
import { detectDistanceUnit } from '@utils/constants';
import {
  validBoolean,
  validColumns,
  validDarkMode,
  validDistanceOptions,
  validDistanceUnit,
  validHeight,
  validLanguage,
  validNonNegative,
  validQuery,
  validRadius,
  validUpdateUrl,
  validView
} from '@utils/configValidation';
import type { CrumbWidgetConfig, Column, TilesConfig, MarkerConfig } from '@/types';

export type { CrumbWidgetConfig, Column, TilesConfig, MarkerConfig };

declare const __APP_VERSION__: string;

/**
 * Options accepted by {@link mountCrumbWidget}. Extends {@link CrumbWidgetConfig}
 * with the two fields that are required up-front in library mode:
 *
 * - `serverUrl` — the BMLT root server to query (required).
 * - `serviceBodyIds` — optional list of service bodies to scope the query to;
 *    when omitted, the widget queries all meetings on the server.
 *
 * All inherited fields from {@link CrumbWidgetConfig} are optional and follow
 * the same defaults as the IIFE bundle.
 */
export interface MountOptions extends CrumbWidgetConfig {
  /** URL of the BMLT root server (required), e.g. `https://bmlt.example.org/main_server/`. */
  serverUrl: string;
  /**
   * Service body IDs to filter by. Defaults to all (every meeting on the
   * server). The search is recursive — child service bodies are included.
   */
  serviceBodyIds?: number[];
}

/**
 * Mount the Crumb Widget into the given DOM element.
 *
 * The element should be empty — the widget renders its full UI into it. The
 * element's `id` (or `"crumb-widget"` if it has none) is used as a stable
 * identifier for in-page anchors and routing.
 *
 * Calling this function:
 *
 * 1. Validates and stores the supplied options into the shared config store.
 * 2. Resolves the active language (explicit `options.language` →
 *    `navigator.language` → `"en"`) and initializes the i18n store.
 * 3. Applies the dark-mode class to the element when `darkMode` is `true` or
 *    `'auto'`.
 * 4. Mounts the root Svelte component, which kicks off the BMLT data load.
 *
 * The function returns synchronously — meeting data loads asynchronously
 * after mount and the widget shows a loading state until it arrives.
 *
 * @param el - The host element to render the widget into.
 * @param options - Configuration. See {@link MountOptions}.
 *
 * @example Minimal mount
 * ```ts
 * mountCrumbWidget(document.getElementById('widget')!, {
 *   serverUrl: 'https://bmlt.example.org/main_server/',
 * });
 * ```
 *
 * @example With service bodies and custom view
 * ```ts
 * mountCrumbWidget(document.getElementById('widget')!, {
 *   serverUrl: 'https://bmlt.example.org/main_server/',
 *   serviceBodyIds: [1, 2, 3],
 *   view: 'both',
 *   darkMode: 'auto',
 * });
 * ```
 */
export function mountCrumbWidget(el: HTMLElement, options: MountOptions): void {
  config.serverUrl = options.serverUrl;
  config.serviceBodyIds = options.serviceBodyIds ?? [];
  config.containerId = el.id || 'crumb-widget';
  config.view = validView(options.view, CONFIG_DEFAULTS.view);
  config.locationMarker = options.map?.markers?.location;
  config.tiles = options.map?.tiles;
  config.tilesDark = options.map?.tiles_dark;
  config.columns = validColumns(options.columns, CONFIG_DEFAULTS.columns);
  config.query = validQuery(options.query);
  // A custom raw query disables geolocation — we can't safely layer geo params on top.
  config.geolocation = !config.query && validBoolean('geolocation', options.geolocation, CONFIG_DEFAULTS.geolocation);
  config.geolocationRadius = validRadius('geolocationRadius', options.geolocationRadius, CONFIG_DEFAULTS.geolocationRadius);
  config.distanceOptions = validDistanceOptions(options.distanceOptions, CONFIG_DEFAULTS.distanceOptions);
  config.height = validHeight(options.height);
  config.darkMode = validDarkMode(options.darkMode, CONFIG_DEFAULTS.darkMode);
  config.nowOffset = validNonNegative('nowOffset', options.nowOffset, CONFIG_DEFAULTS.nowOffset);
  config.hideHeader = validBoolean('hideHeader', options.hideHeader, CONFIG_DEFAULTS.hideHeader);
  config.showFormats = validBoolean('showFormats', options.showFormats, CONFIG_DEFAULTS.showFormats);
  config.updateUrl = validUpdateUrl(options.updateUrl);

  if (options.basePath != null) {
    setHashMode(false, options.basePath);
  }

  const explicitLanguage = validLanguage(options.language, SUPPORTED_LANGUAGES);
  const language = explicitLanguage ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
  // Auto-detect mi/km from the resolved locale; explicit distanceUnit always wins.
  config.distanceUnit = validDistanceUnit(options.distanceUnit, detectDistanceUnit(language));
  initLocalization(language);

  if (config.darkMode === 'auto') {
    el.classList.add('bmlt-dark-auto');
  } else if (config.darkMode === true) {
    el.classList.add('bmlt-dark-force');
  }

  console.log(`[crumb-widget] v${__APP_VERSION__}`);

  mount(App, { target: el, props: { config } });
}
