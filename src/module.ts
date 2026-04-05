import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { config } from '@stores/config.svelte';
import { initLocalization } from '@stores/localization';
import type { CrumbWidgetConfig, Column } from '@/types';

export type { CrumbWidgetConfig, Column };

declare const __APP_VERSION__: string;

const ALL_COLUMNS: Column[] = ['time', 'name', 'location', 'address'];

export interface MountOptions extends CrumbWidgetConfig {
  /** URL of the BMLT root server (required) */
  rootServerUrl: string;
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
 *   rootServerUrl: 'https://bmlt.example.org/main_server/',
 *   serviceBodyIds: [1, 2, 3],
 * });
 * ```
 */
export function mountCrumbWidget(el: HTMLElement, options: MountOptions): void {
  config.rootServerUrl = options.rootServerUrl;
  config.serviceBodyIds = options.serviceBodyIds ?? [];
  config.containerId = el.id || 'crumb-widget';
  config.defaultView = options.defaultView ?? 'list';
  config.locationMarker = options.map?.markers?.location;
  config.tiles = options.map?.tiles;
  config.tilesDark = options.map?.tiles_dark;
  config.columns = options.columns ?? ALL_COLUMNS;
  config.geolocation = options.geolocation ?? false;
  config.geolocationRadius = options.geolocationRadius ?? 10;
  config.height = options.height;
  config.darkMode = options.darkMode ?? false;
  config.nowOffset = options.nowOffset ?? 10;
  config.hideHeader = options.hideHeader ?? false;

  const language = options.language ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
  initLocalization(language);

  if (config.darkMode === 'auto') {
    el.classList.add('bmlt-dark-auto');
  } else if (config.darkMode === true) {
    el.classList.add('bmlt-dark-force');
  }

  console.log(`[crumb-widget] v${__APP_VERSION__}`);

  mount(App, { target: el, props: { config } });
}
