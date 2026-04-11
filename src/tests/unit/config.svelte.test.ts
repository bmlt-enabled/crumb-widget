import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { config, initConfig } from '@stores/config.svelte';

function makeElement(attrs: Record<string, string> = {}, id = 'crumb-widget'): HTMLElement {
  const el = document.createElement('div');
  if (id) el.id = id;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

beforeEach(() => {
  delete window.CrumbWidgetConfig;
});

afterEach(() => {
  delete window.CrumbWidgetConfig;
});

describe('initConfig', () => {
  test('reads server url from data attribute', () => {
    initConfig(makeElement({ 'data-server': 'https://example.com/main_server/' }));
    expect(config.serverUrl).toBe('https://example.com/main_server/');
  });

  test('parses single service body id', () => {
    initConfig(makeElement({ 'data-service-body': '3' }));
    expect(config.serviceBodyIds).toEqual([3]);
  });

  test('parses comma-separated service body ids', () => {
    initConfig(makeElement({ 'data-service-body': '3, 5, 12' }));
    expect(config.serviceBodyIds).toEqual([3, 5, 12]);
  });

  test('filters out NaN from service body ids', () => {
    initConfig(makeElement({ 'data-service-body': '3, bad, 5' }));
    expect(config.serviceBodyIds).toEqual([3, 5]);
  });

  test('defaults to empty service body ids when attribute missing', () => {
    initConfig(makeElement());
    expect(config.serviceBodyIds).toEqual([]);
  });

  test('reads view from data attribute', () => {
    initConfig(makeElement({ 'data-view': 'map' }));
    expect(config.defaultView).toBe('map');
  });

  test('reads both view from data attribute', () => {
    initConfig(makeElement({ 'data-view': 'both' }));
    expect(config.defaultView).toBe('both');
  });

  test('defaults to list view', () => {
    initConfig(makeElement());
    expect(config.defaultView).toBe('list');
  });

  test('uses element id as containerId', () => {
    initConfig(makeElement({}, 'my-widget'));
    expect(config.containerId).toBe('my-widget');
  });

  test('falls back to crumb-widget when element has no id', () => {
    const el = document.createElement('div');
    initConfig(el);
    expect(config.containerId).toBe('crumb-widget');
  });

  test('defaults geolocation to false for non-aggregator server', () => {
    initConfig(makeElement({ 'data-server': 'https://example.com/main_server/' }));
    expect(config.geolocation).toBe(false);
  });

  test('defaults geolocation to true for aggregator.bmltenabled.org server', () => {
    initConfig(makeElement({ 'data-server': 'https://aggregator.bmltenabled.org/main_server/' }));
    expect(config.geolocation).toBe(true);
  });

  test('defaults geolocation to false when no server set', () => {
    initConfig(makeElement());
    expect(config.geolocation).toBe(false);
  });

  test('defaults geolocationRadius to 75', () => {
    initConfig(makeElement());
    expect(config.geolocationRadius).toBe(75);
  });

  test('defaults height to undefined', () => {
    initConfig(makeElement());
    expect(config.height).toBeUndefined();
  });

  describe('CrumbWidgetConfig overrides', () => {
    test('overrides defaultView to map', () => {
      window.CrumbWidgetConfig = { defaultView: 'map' };
      initConfig(makeElement());
      expect(config.defaultView).toBe('map');
    });

    test('overrides defaultView to both', () => {
      window.CrumbWidgetConfig = { defaultView: 'both' };
      initConfig(makeElement());
      expect(config.defaultView).toBe('both');
    });

    test('overrides geolocation to true', () => {
      window.CrumbWidgetConfig = { geolocation: true };
      initConfig(makeElement());
      expect(config.geolocation).toBe(true);
    });

    test('overrides aggregator default geolocation to false', () => {
      window.CrumbWidgetConfig = { geolocation: false };
      initConfig(makeElement({ 'data-server': 'https://aggregator.bmltenabled.org/main_server/' }));
      expect(config.geolocation).toBe(false);
    });

    test('overrides geolocationRadius', () => {
      window.CrumbWidgetConfig = { geolocationRadius: 25 };
      initConfig(makeElement());
      expect(config.geolocationRadius).toBe(25);
    });

    test('overrides height', () => {
      window.CrumbWidgetConfig = { height: 500 };
      initConfig(makeElement());
      expect(config.height).toBe(500);
    });

    test('overrides columns', () => {
      window.CrumbWidgetConfig = { columns: ['time', 'name'] };
      initConfig(makeElement());
      expect(config.columns).toEqual(['time', 'name']);
    });

    test('overrides map tiles', () => {
      const tiles = { url: 'https://tiles.example.com/{z}/{x}/{y}.png', attribution: 'Test' };
      window.CrumbWidgetConfig = { map: { tiles } };
      initConfig(makeElement());
      expect(config.tiles).toEqual(tiles);
    });

    test('overrides dark tiles', () => {
      const tilesDark = { url: 'https://dark.example.com/{z}/{x}/{y}.png', attribution: 'Dark' };
      window.CrumbWidgetConfig = { map: { tiles_dark: tilesDark } };
      initConfig(makeElement());
      expect(config.tilesDark).toEqual(tilesDark);
    });

    test('overrides location marker', () => {
      const marker = { html: '<div>X</div>', width: 30, height: 30 };
      window.CrumbWidgetConfig = { map: { markers: { location: marker } } };
      initConfig(makeElement());
      expect(config.locationMarker).toEqual(marker);
    });

    test('global config defaultView takes precedence over data-view attribute', () => {
      window.CrumbWidgetConfig = { defaultView: 'list' };
      initConfig(makeElement({ 'data-view': 'map' }));
      expect(config.defaultView).toBe('list');
    });
  });
});
