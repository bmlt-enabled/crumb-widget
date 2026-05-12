import type { AppConfig, Column } from '@/types';
import { setHashMode } from '@bmlt-enabled/svelte-spa-router';
import { initLocalization, SUPPORTED_LANGUAGES } from './localization';
import { detectDistanceUnit } from '@utils/constants';
import {
  parseFormatIds,
  parseFormatKeys,
  parseServiceBodyIds,
  validBoolean,
  validColumns,
  validDarkMode,
  validDistanceOptions,
  validDistanceUnit,
  validFormatKeys,
  validHeight,
  validLanguage,
  validNonNegative,
  validQuery,
  validRadius,
  validServerUrl,
  validUpdateUrl,
  validView
} from '@utils/configValidation';

const ALL_COLUMNS: Column[] = ['time', 'distance', 'name', 'location', 'address'];

export const CONFIG_DEFAULTS = {
  view: 'list',
  columns: ALL_COLUMNS,
  geolocation: false,
  geolocationRadius: -50,
  distanceOptions: [5, 10, 15, 25, 50, 100],
  distanceUnit: 'mi',
  nowOffset: 10,
  hideHeader: false,
  darkMode: false as 'auto' | true | false
} satisfies Partial<AppConfig>;

export const config = $state<AppConfig>({
  serverUrl: '',
  serviceBodyIds: [],
  formatIds: [],
  formatKeys: [],
  containerId: 'crumb-widget',
  height: undefined,
  ...CONFIG_DEFAULTS,
  columns: [...CONFIG_DEFAULTS.columns],
  distanceOptions: [...CONFIG_DEFAULTS.distanceOptions]
});

export function initConfig(el: HTMLElement): void {
  const server = validServerUrl(el.getAttribute('data-server') ?? '');
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const query = new URLSearchParams(window.location.search);
  const serviceBody = query.get('services') ?? el.getAttribute('data-service-body') ?? '';
  const formatIdsRaw = query.get('format_ids') ?? el.getAttribute('data-format-ids') ?? '';
  const dataPath = el.getAttribute('data-path');

  // data-path enables History API routing with a base path (e.g. "/meetings")
  // Without it, hash-based routing is used (default)
  if (dataPath != null) {
    setHashMode(false, dataPath);
  }

  const globalCfg = window.CrumbWidgetConfig ?? {};
  const dataView = validView(el.getAttribute('data-view'), CONFIG_DEFAULTS.view);
  // data-columns is a comma-separated list (e.g. "time,name,address"); CrumbWidgetConfig.columns overrides.
  const dataColumnsRaw = el.getAttribute('data-columns');
  const dataColumns =
    dataColumnsRaw != null
      ? validColumns(
          dataColumnsRaw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          CONFIG_DEFAULTS.columns
        )
      : CONFIG_DEFAULTS.columns;

  config.serverUrl = server;
  config.serviceBodyIds = parseServiceBodyIds(serviceBody);
  config.formatIds = parseFormatIds(formatIdsRaw);
  // ?formats= overrides CrumbWidgetConfig.formats (key strings, client-side filter)
  const formatsParam = query.get('formats');
  config.formatKeys = formatsParam != null ? parseFormatKeys(formatsParam) : validFormatKeys(globalCfg.formats, []);
  config.view = validView(globalCfg.view, dataView);
  config.containerId = el.id || 'crumb-widget';
  config.locationMarker = globalCfg.map?.markers?.location;
  config.tiles = globalCfg.map?.tiles;
  config.tilesDark = globalCfg.map?.tiles_dark;
  config.columns = validColumns(globalCfg.columns, dataColumns);
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const isAggregator = URL.canParse(server) && new URL(server).hostname === 'aggregator.bmltenabled.org';
  // data-query overrides CrumbWidgetConfig.query
  config.query = validQuery(el.getAttribute('data-query') ?? globalCfg.query);
  // Defaults on for the unconstrained aggregator only. With a service body the result set is
  // already scoped, so we skip the browser geolocation prompt and hide the typed-location
  // search by default — embedders can still opt in explicitly. A custom query forces it off:
  // we can't safely layer lat_val/long_val/geo_width on top of an arbitrary raw query.
  config.geolocation = !config.query && validBoolean('geolocation', globalCfg.geolocation, isAggregator && config.serviceBodyIds.length === 0);
  config.geolocationRadius = validRadius('geolocationRadius', globalCfg.geolocationRadius, CONFIG_DEFAULTS.geolocationRadius);
  config.distanceOptions = validDistanceOptions(globalCfg.distanceOptions, CONFIG_DEFAULTS.distanceOptions);
  config.height = validHeight(globalCfg.height);
  config.darkMode = validDarkMode(globalCfg.darkMode, CONFIG_DEFAULTS.darkMode);
  config.nowOffset = validNonNegative('nowOffset', globalCfg.nowOffset, CONFIG_DEFAULTS.nowOffset);
  config.hideHeader = validBoolean('hideHeader', globalCfg.hideHeader, CONFIG_DEFAULTS.hideHeader);
  // data-update-url overrides CrumbWidgetConfig.updateUrl
  config.updateUrl = validUpdateUrl(el.getAttribute('data-update-url') ?? globalCfg.updateUrl);

  const explicitLanguage = validLanguage(globalCfg.language, SUPPORTED_LANGUAGES);
  const language = explicitLanguage ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
  // Auto-detect mi/km from the resolved locale; explicit distanceUnit always wins.
  config.distanceUnit = validDistanceUnit(globalCfg.distanceUnit, detectDistanceUnit(language));
  initLocalization(language);
}
