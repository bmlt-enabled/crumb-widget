import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { config, CONFIG_DEFAULTS } from '@stores/config.svelte';
import { setHashMode } from '@bmlt-enabled/svelte-spa-router';
import { initLocalization, SUPPORTED_LANGUAGES } from '@stores/localization';
import { validBoolean, validColumns, validDarkMode, validDistanceOptions, validDistanceUnit, validHeight, validLanguage, validNonNegative, validPositive, validView } from '@utils/configValidation';
import type { CrumbWidgetConfig, Column } from '@/types';

export type { CrumbWidgetConfig, Column };

declare const __APP_VERSION__: string;

export interface MountOptions extends CrumbWidgetConfig {
  /** URL of the BMLT server (required) */
  serverUrl: string;
  /** Service body IDs to filter by (defaults to all) */
  serviceBodyIds?: number[];
}

/**
 * Mount the Crumb Widget into the given element.
 *
 * @example
 * ```ts
 * import { mountCrumbWidget } from 'crumb-widget';
 *
 * mountCrumbWidget(document.getElementById('my-widget'), {
 *   serverUrl: 'https://bmlt.example.org/main_server/',
 *   serviceBodyIds: [1, 2, 3],
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
  config.geolocation = validBoolean('geolocation', options.geolocation, CONFIG_DEFAULTS.geolocation);
  config.geolocationRadius = validPositive('geolocationRadius', options.geolocationRadius, CONFIG_DEFAULTS.geolocationRadius);
  config.distanceOptions = validDistanceOptions(options.distanceOptions, CONFIG_DEFAULTS.distanceOptions);
  config.distanceUnit = validDistanceUnit(options.distanceUnit, CONFIG_DEFAULTS.distanceUnit);
  config.height = validHeight(options.height);
  config.darkMode = validDarkMode(options.darkMode, CONFIG_DEFAULTS.darkMode);
  config.nowOffset = validNonNegative('nowOffset', options.nowOffset, CONFIG_DEFAULTS.nowOffset);
  config.hideHeader = validBoolean('hideHeader', options.hideHeader, CONFIG_DEFAULTS.hideHeader);

  if (options.basePath != null) {
    setHashMode(false, options.basePath);
  }

  const explicitLanguage = validLanguage(options.language, SUPPORTED_LANGUAGES);
  const language = explicitLanguage ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
  initLocalization(language);

  if (config.darkMode === 'auto') {
    el.classList.add('bmlt-dark-auto');
  } else if (config.darkMode === true) {
    el.classList.add('bmlt-dark-force');
  }

  console.log(`[crumb-widget] v${__APP_VERSION__}`);

  mount(App, { target: el, props: { config } });
}
