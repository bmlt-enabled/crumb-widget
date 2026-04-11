import type { AppConfig, Column } from '@/types';
import { setHashMode } from '@bmlt-enabled/svelte-spa-router';
import { initLocalization } from './localization';

const ALL_COLUMNS: Column[] = ['time', 'name', 'location', 'address'];

const defaultConfig: AppConfig = {
  serverUrl: '',
  serviceBodyIds: [],
  defaultView: 'list',
  containerId: 'crumb-widget',
  columns: ALL_COLUMNS,
  geolocation: false,
  geolocationRadius: 75,
  height: undefined,
  nowOffset: 10
};

export const config = $state<AppConfig>({ ...defaultConfig });

export function initConfig(el: HTMLElement): void {
  const server = el.getAttribute('data-server') ?? '';
  const serviceBody = el.getAttribute('data-service-body') ?? '';
  const defaultView = (el.getAttribute('data-view') as 'list' | 'map' | 'both') ?? 'list';
  const dataPath = el.getAttribute('data-path');

  // data-path enables History API routing with a base path (e.g. "/meetings")
  // Without it, hash-based routing is used (default)
  if (dataPath != null) {
    setHashMode(false, dataPath);
  }

  const globalCfg = window.CrumbWidgetConfig ?? {};

  config.serverUrl = server;
  config.serviceBodyIds = serviceBody
    ? serviceBody
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n))
    : [];
  config.defaultView = globalCfg.defaultView ?? defaultView;
  config.containerId = el.id || 'crumb-widget';
  config.locationMarker = globalCfg.map?.markers?.location;
  config.tiles = globalCfg.map?.tiles;
  config.tilesDark = globalCfg.map?.tiles_dark;
  config.columns = globalCfg.columns ?? ALL_COLUMNS;
  const isAggregator = server.includes('https://aggregator.bmltenabled.org');
  config.geolocation = globalCfg.geolocation ?? isAggregator;
  config.geolocationRadius = globalCfg.geolocationRadius ?? 75;
  config.height = globalCfg.height ?? undefined;
  config.darkMode = globalCfg.darkMode ?? false;
  config.nowOffset = globalCfg.nowOffset ?? 10;
  config.hideHeader = globalCfg.hideHeader ?? false;

  const language = globalCfg.language ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
  initLocalization(language);
}
