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
  window.history.replaceState(null, '', '/');
});

afterEach(() => {
  delete window.CrumbWidgetConfig;
  window.history.replaceState(null, '', '/');
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

  test('?services query param overrides data-service-body', () => {
    window.history.replaceState(null, '', '/?services=7');
    initConfig(makeElement({ 'data-service-body': '3' }));
    expect(config.serviceBodyIds).toEqual([7]);
  });

  test('?services query param accepts comma-separated ids', () => {
    window.history.replaceState(null, '', '/?services=1,2,3');
    initConfig(makeElement({ 'data-service-body': '99' }));
    expect(config.serviceBodyIds).toEqual([1, 2, 3]);
  });

  test('?services= (empty) clears configured service body', () => {
    window.history.replaceState(null, '', '/?services=');
    initConfig(makeElement({ 'data-service-body': '3' }));
    expect(config.serviceBodyIds).toEqual([]);
  });

  test('falls back to data-service-body when ?services not present', () => {
    window.history.replaceState(null, '', '/?other=1');
    initConfig(makeElement({ 'data-service-body': '3' }));
    expect(config.serviceBodyIds).toEqual([3]);
  });

  test('parses format ids from data-format-ids', () => {
    initConfig(makeElement({ 'data-format-ids': '4, 7, 12' }));
    expect(config.formatIds).toEqual([4, 7, 12]);
  });

  test('?format_ids overrides data-format-ids', () => {
    window.history.replaceState(null, '', '/?format_ids=9');
    initConfig(makeElement({ 'data-format-ids': '4' }));
    expect(config.formatIds).toEqual([9]);
  });

  test('defaults formatIds to empty array', () => {
    initConfig(makeElement());
    expect(config.formatIds).toEqual([]);
  });

  test('reads format keys from CrumbWidgetConfig.formats', () => {
    window.CrumbWidgetConfig = { formats: ['O', 'BT'] };
    initConfig(makeElement());
    expect(config.formatKeys).toEqual(['O', 'BT']);
  });

  test('?formats overrides CrumbWidgetConfig.formats', () => {
    window.CrumbWidgetConfig = { formats: ['O'] };
    window.history.replaceState(null, '', '/?formats=BT,WC');
    initConfig(makeElement());
    expect(config.formatKeys).toEqual(['BT', 'WC']);
  });

  test('?formats= (empty) clears configured format keys', () => {
    window.CrumbWidgetConfig = { formats: ['O'] };
    window.history.replaceState(null, '', '/?formats=');
    initConfig(makeElement());
    expect(config.formatKeys).toEqual([]);
  });

  test('formatIds and formatKeys can be set simultaneously', () => {
    window.CrumbWidgetConfig = { formats: ['O'] };
    initConfig(makeElement({ 'data-format-ids': '4,7' }));
    expect(config.formatIds).toEqual([4, 7]);
    expect(config.formatKeys).toEqual(['O']);
  });

  test('reads view from data attribute', () => {
    initConfig(makeElement({ 'data-view': 'map' }));
    expect(config.view).toBe('map');
  });

  test('reads both view from data attribute', () => {
    initConfig(makeElement({ 'data-view': 'both' }));
    expect(config.view).toBe('both');
  });

  test('defaults to list view', () => {
    initConfig(makeElement());
    expect(config.view).toBe('list');
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

  test('defaults distanceOptions to [1,2,5,10,15,25,50,100]', () => {
    initConfig(makeElement());
    expect(config.distanceOptions).toEqual([5, 10, 15, 25, 50, 100]);
  });

  test('defaults distanceUnit to mi', () => {
    initConfig(makeElement());
    expect(config.distanceUnit).toBe('mi');
  });

  test('defaults height to undefined', () => {
    initConfig(makeElement());
    expect(config.height).toBeUndefined();
  });

  describe('CrumbWidgetConfig overrides', () => {
    test('overrides view to map', () => {
      window.CrumbWidgetConfig = { view: 'map' };
      initConfig(makeElement());
      expect(config.view).toBe('map');
    });

    test('overrides view to both', () => {
      window.CrumbWidgetConfig = { view: 'both' };
      initConfig(makeElement());
      expect(config.view).toBe('both');
    });

    test('overrides geolocation to true', () => {
      window.CrumbWidgetConfig = { geolocation: true };
      initConfig(makeElement());
      expect(config.geolocation).toBe(true);
    });

    test('accepts WordPress string "1" as geolocation true', () => {
      window.CrumbWidgetConfig = { geolocation: '1' as unknown as boolean };
      initConfig(makeElement());
      expect(config.geolocation).toBe(true);
    });

    test('accepts WordPress string "0" as geolocation false', () => {
      window.CrumbWidgetConfig = { geolocation: '0' as unknown as boolean };
      initConfig(makeElement({ 'data-server': 'https://aggregator.bmltenabled.org/main_server/' }));
      expect(config.geolocation).toBe(false);
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

    test('overrides distanceOptions', () => {
      window.CrumbWidgetConfig = { distanceOptions: [5, 10, 20] };
      initConfig(makeElement());
      expect(config.distanceOptions).toEqual([5, 10, 20]);
    });

    test('overrides distanceUnit to km', () => {
      window.CrumbWidgetConfig = { distanceUnit: 'km' };
      initConfig(makeElement());
      expect(config.distanceUnit).toBe('km');
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

    test('global config view takes precedence over data-view attribute', () => {
      window.CrumbWidgetConfig = { view: 'list' };
      initConfig(makeElement({ 'data-view': 'map' }));
      expect(config.view).toBe('list');
    });
  });
});
