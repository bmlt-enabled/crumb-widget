import type { AppConfig, Column } from '@/types';
import { initLocalization } from './localization';

const ALL_COLUMNS: Column[] = ['time', 'name', 'location', 'address'];

const defaultConfig: AppConfig = {
  rootServerUrl: '',
  serviceBodyIds: [],
  defaultView: 'list',
  containerId: 'bmlt-meeting-list',
  showCalendar: true,
  columns: ALL_COLUMNS,
  geolocation: false,
  geolocationRadius: 10
};

export const config = $state<AppConfig>({ ...defaultConfig });

export function initConfig(el: HTMLElement): void {
  const rootServer = el.getAttribute('data-root-server') ?? '';
  const serviceBody = el.getAttribute('data-service-body') ?? '';
  const defaultView = (el.getAttribute('data-view') as 'list' | 'map') ?? 'list';

  const globalCfg = window.BmltMeetingListConfig ?? {};

  config.rootServerUrl = rootServer;
  config.serviceBodyIds = serviceBody
    ? serviceBody
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n))
    : [];
  config.defaultView = globalCfg.defaultView ?? defaultView;
  config.containerId = el.id || 'bmlt-meeting-list';
  config.locationMarker = globalCfg.map?.markers?.location;
  config.tiles = globalCfg.map?.tiles;
  config.tilesDark = globalCfg.map?.tiles_dark;
  config.showCalendar = globalCfg.calendar !== false;
  config.columns = globalCfg.columns ?? ALL_COLUMNS;
  config.geolocation = globalCfg.geolocation ?? false;
  config.geolocationRadius = globalCfg.geolocationRadius ?? 10;

  const language = globalCfg.language ?? (typeof navigator !== 'undefined' ? navigator.language : 'en');
  initLocalization(language);
}
