import type { AppConfig, Column } from '@/types';
import { setHashMode } from '@bmlt-enabled/svelte-spa-router';
import { initLocalization } from './localization';

const ALL_COLUMNS: Column[] = ['time', 'name', 'location', 'address'];

export const CONFIG_DEFAULTS = {
  view: 'list',
  columns: ALL_COLUMNS,
  geolocation: false,
  geolocationRadius: 75,
  distanceOptions: [5, 10, 15, 25, 50, 100],
  distanceUnit: 'mi',
  nowOffset: 10,
  hideHeader: false,
  darkMode: false as 'auto' | true | false
} satisfies Partial<AppConfig>;

export const config = $state<AppConfig>({
  serverUrl: '',
  serviceBodyIds: [],
  containerId: 'crumb-widget',
  height: undefined,
  ...CONFIG_DEFAULTS,
  columns: [...CONFIG_DEFAULTS.columns],
  distanceOptions: [...CONFIG_DEFAULTS.distanceOptions]
});

export function initConfig(el: HTMLElement): void {
  const server = el.getAttribute('data-server') ?? '';
  const serviceBody = el.getAttribute('data-service-body') ?? '';
  const view = (el.getAttribute('data-view') as 'list' | 'map' | 'both') ?? 'list';
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
  config.view = globalCfg.view ?? view;
  config.containerId = el.id || 'crumb-widget';
  config.locationMarker = globalCfg.map?.markers?.location;
  config.tiles = globalCfg.map?.tiles;
  config.tilesDark = globalCfg.map?.tiles_dark;
  config.columns = globalCfg.columns ?? [...CONFIG_DEFAULTS.columns];
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const isAggregator = URL.canParse(server) && new URL(server).hostname === 'aggregator.bmltenabled.org';
  config.geolocation = globalCfg.geolocation ?? isAggregator;
  config.geolocationRadius = globalCfg.geolocationRadius ?? CONFIG_DEFAULTS.geolocationRadius;
  config.distanceOptions = globalCfg.distanceOptions ?? [...CONFIG_DEFAULTS.distanceOptions];
  config.distanceUnit = globalCfg.distanceUnit ?? CONFIG_DEFAULTS.distanceUnit;
  config.height = globalCfg.height ?? undefined;
  config.darkMode = globalCfg.darkMode ?? CONFIG_DEFAULTS.darkMode;
  config.nowOffset = globalCfg.nowOffset ?? CONFIG_DEFAULTS.nowOffset;
  config.hideHeader = globalCfg.hideHeader ?? CONFIG_DEFAULTS.hideHeader;

  const language = globalCfg.language ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
  initLocalization(language);
}
