import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { config, initConfig } from '@stores/config.svelte';

function makeElement(attrs: Record<string, string> = {}, id = 'crumb-widget'): HTMLElement {
  const el = document.createElement('div');
  if (id) el.id = id;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  delete window.CrumbWidgetConfig;
  window.history.replaceState(null, '', '/');
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  delete window.CrumbWidgetConfig;
  window.history.replaceState(null, '', '/');
  warnSpy.mockRestore();
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

  test('data-formats sets formatKeys', () => {
    initConfig(makeElement({ 'data-formats': 'O,BT' }));
    expect(config.formatKeys).toEqual(['O', 'BT']);
  });

  test('data-formats overrides CrumbWidgetConfig.formats', () => {
    window.CrumbWidgetConfig = { formats: ['O'] };
    initConfig(makeElement({ 'data-formats': 'BT,WC' }));
    expect(config.formatKeys).toEqual(['BT', 'WC']);
  });

  test('?formats overrides data-formats', () => {
    window.history.replaceState(null, '', '/?formats=D');
    initConfig(makeElement({ 'data-formats': 'O,BT' }));
    expect(config.formatKeys).toEqual(['D']);
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

  test('defaults inlineFormats to empty array', () => {
    initConfig(makeElement());
    expect(config.inlineFormats).toEqual([]);
  });

  test('reads inlineFormats from CrumbWidgetConfig.inlineFormats', () => {
    window.CrumbWidgetConfig = { inlineFormats: ['M', 'W'] };
    initConfig(makeElement());
    expect(config.inlineFormats).toEqual(['M', 'W']);
  });

  test('data-inline-formats overrides CrumbWidgetConfig.inlineFormats', () => {
    window.CrumbWidgetConfig = { inlineFormats: ['M'] };
    initConfig(makeElement({ 'data-inline-formats': 'W, LGBTQ' }));
    expect(config.inlineFormats).toEqual(['W', 'LGBTQ']);
  });

  test('data-inline-formats (empty) clears configured inlineFormats', () => {
    window.CrumbWidgetConfig = { inlineFormats: ['M', 'W'] };
    initConfig(makeElement({ 'data-inline-formats': '' }));
    expect(config.inlineFormats).toEqual([]);
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

  test('reads columns from data-columns attribute', () => {
    initConfig(makeElement({ 'data-columns': 'time,name,address' }));
    expect(config.columns).toEqual(['time', 'name', 'address']);
  });

  test('data-columns trims whitespace and drops empty entries', () => {
    initConfig(makeElement({ 'data-columns': ' time , , name ,address ' }));
    expect(config.columns).toEqual(['time', 'name', 'address']);
  });

  test('invalid data-columns falls back to default', () => {
    initConfig(makeElement({ 'data-columns': 'time,bogus' }));
    expect(config.columns).toEqual(['time', 'distance', 'name', 'location', 'address']);
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

  test('defaults geolocation to true for unconstrained aggregator', () => {
    initConfig(makeElement({ 'data-server': 'https://aggregator.bmltenabled.org/main_server/' }));
    expect(config.geolocation).toBe(true);
  });

  test('defaults geolocation to false when aggregator is scoped to a service body', () => {
    initConfig(makeElement({ 'data-server': 'https://aggregator.bmltenabled.org/main_server/', 'data-service-body': '95,173' }));
    expect(config.geolocation).toBe(false);
  });

  test('defaults geolocation to false when no server set', () => {
    initConfig(makeElement());
    expect(config.geolocation).toBe(false);
  });

  test('defaults geolocationRadius to -50 (auto-radius)', () => {
    initConfig(makeElement());
    expect(config.geolocationRadius).toBe(-50);
  });

  test('defaults distanceOptions to [1,2,5,10,15,25,50,100]', () => {
    initConfig(makeElement());
    expect(config.distanceOptions).toEqual([5, 10, 15, 25, 50, 100]);
  });

  test('defaults distanceUnit by auto-detecting from navigator.language (en-US → mi)', () => {
    // jsdom's navigator.language is 'en-US' by default
    initConfig(makeElement());
    expect(config.distanceUnit).toBe('mi');
  });

  test('auto-detects km when language override is metric', () => {
    window.CrumbWidgetConfig = { language: 'de' };
    initConfig(makeElement());
    expect(config.distanceUnit).toBe('km');
  });

  test('explicit distanceUnit overrides auto-detection', () => {
    window.CrumbWidgetConfig = { language: 'de', distanceUnit: 'mi' };
    initConfig(makeElement());
    expect(config.distanceUnit).toBe('mi');
  });

  test('defaults height to undefined', () => {
    initConfig(makeElement());
    expect(config.height).toBeUndefined();
  });

  describe('data attribute overrides', () => {
    test('data-hide-header="true" sets hideHeader', () => {
      initConfig(makeElement({ 'data-hide-header': 'true' }));
      expect(config.hideHeader).toBe(true);
    });

    test('data-hide-header="1" sets hideHeader', () => {
      initConfig(makeElement({ 'data-hide-header': '1' }));
      expect(config.hideHeader).toBe(true);
    });

    test('data-hide-header overrides CrumbWidgetConfig.hideHeader', () => {
      window.CrumbWidgetConfig = { hideHeader: false };
      initConfig(makeElement({ 'data-hide-header': 'true' }));
      expect(config.hideHeader).toBe(true);
    });

    test('data-dark-mode="auto" sets darkMode', () => {
      initConfig(makeElement({ 'data-dark-mode': 'auto' }));
      expect(config.darkMode).toBe('auto');
    });

    test('data-dark-mode="true" forces dark mode', () => {
      initConfig(makeElement({ 'data-dark-mode': 'true' }));
      expect(config.darkMode).toBe(true);
    });

    test('data-dark-mode="false" forces light mode', () => {
      initConfig(makeElement({ 'data-dark-mode': 'false' }));
      expect(config.darkMode).toBe(false);
    });

    test('data-dark-mode overrides CrumbWidgetConfig.darkMode', () => {
      window.CrumbWidgetConfig = { darkMode: true };
      initConfig(makeElement({ 'data-dark-mode': 'false' }));
      expect(config.darkMode).toBe(false);
    });

    test('data-height sets height', () => {
      initConfig(makeElement({ 'data-height': '400' }));
      expect(config.height).toBe(400);
    });

    test('data-height overrides CrumbWidgetConfig.height', () => {
      window.CrumbWidgetConfig = { height: 600 };
      initConfig(makeElement({ 'data-height': '400' }));
      expect(config.height).toBe(400);
    });

    test('invalid data-height falls back to undefined', () => {
      initConfig(makeElement({ 'data-height': 'tall' }));
      expect(config.height).toBeUndefined();
    });

    test('data-now-offset sets nowOffset', () => {
      initConfig(makeElement({ 'data-now-offset': '15' }));
      expect(config.nowOffset).toBe(15);
    });

    test('data-now-offset overrides CrumbWidgetConfig.nowOffset', () => {
      window.CrumbWidgetConfig = { nowOffset: 5 };
      initConfig(makeElement({ 'data-now-offset': '20' }));
      expect(config.nowOffset).toBe(20);
    });

    test('data-distance-unit="km" sets distanceUnit', () => {
      initConfig(makeElement({ 'data-distance-unit': 'km' }));
      expect(config.distanceUnit).toBe('km');
    });

    test('data-distance-unit overrides CrumbWidgetConfig.distanceUnit', () => {
      window.CrumbWidgetConfig = { distanceUnit: 'mi' };
      initConfig(makeElement({ 'data-distance-unit': 'km' }));
      expect(config.distanceUnit).toBe('km');
    });

    test('data-geolocation-radius sets a fixed radius', () => {
      initConfig(makeElement({ 'data-geolocation-radius': '25' }));
      expect(config.geolocationRadius).toBe(25);
    });

    test('data-geolocation-radius negative integer sets auto-radius', () => {
      initConfig(makeElement({ 'data-geolocation-radius': '-100' }));
      expect(config.geolocationRadius).toBe(-100);
    });

    test('data-geolocation-radius overrides CrumbWidgetConfig.geolocationRadius', () => {
      window.CrumbWidgetConfig = { geolocationRadius: 10 };
      initConfig(makeElement({ 'data-geolocation-radius': '50' }));
      expect(config.geolocationRadius).toBe(50);
    });

    test('data-distance-options sets distanceOptions', () => {
      initConfig(makeElement({ 'data-distance-options': '5,10,25' }));
      expect(config.distanceOptions).toEqual([5, 10, 25]);
    });

    test('data-distance-options overrides CrumbWidgetConfig.distanceOptions', () => {
      window.CrumbWidgetConfig = { distanceOptions: [1, 2, 3] };
      initConfig(makeElement({ 'data-distance-options': '5,10,25' }));
      expect(config.distanceOptions).toEqual([5, 10, 25]);
    });

    test('data-language sets language (reflected via distanceUnit auto-detect)', () => {
      initConfig(makeElement({ 'data-language': 'de' }));
      expect(config.distanceUnit).toBe('km');
    });

    test('data-language overrides CrumbWidgetConfig.language', () => {
      window.CrumbWidgetConfig = { language: 'en' };
      initConfig(makeElement({ 'data-language': 'de' }));
      expect(config.distanceUnit).toBe('km');
    });
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

    test('overrides aggregator+service-body default geolocation to true via config', () => {
      window.CrumbWidgetConfig = { geolocation: true };
      initConfig(makeElement({ 'data-server': 'https://aggregator.bmltenabled.org/main_server/', 'data-service-body': '95,173' }));
      expect(config.geolocation).toBe(true);
    });

    test('overrides geolocationRadius with positive value', () => {
      window.CrumbWidgetConfig = { geolocationRadius: 25 };
      initConfig(makeElement());
      expect(config.geolocationRadius).toBe(25);
    });

    test('overrides geolocationRadius with negative integer (auto-radius)', () => {
      window.CrumbWidgetConfig = { geolocationRadius: -50 };
      initConfig(makeElement());
      expect(config.geolocationRadius).toBe(-50);
    });

    test('rejects zero geolocationRadius and uses default', () => {
      window.CrumbWidgetConfig = { geolocationRadius: 0 };
      initConfig(makeElement());
      expect(config.geolocationRadius).toBe(-50);
    });

    test('rejects negative float geolocationRadius and uses default', () => {
      window.CrumbWidgetConfig = { geolocationRadius: -1.5 };
      initConfig(makeElement());
      expect(config.geolocationRadius).toBe(-50);
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

    test('CrumbWidgetConfig.columns overrides data-columns', () => {
      window.CrumbWidgetConfig = { columns: ['time', 'name'] };
      initConfig(makeElement({ 'data-columns': 'time,address,service_body' }));
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

    test('data-view attribute takes precedence over global config view', () => {
      // Matches the precedence of every other attribute/config pair (data-update-url,
      // data-query, data-geolocation, etc.) — the embedder-supplied per-instance attribute
      // wins over the page-wide CrumbWidgetConfig.
      window.CrumbWidgetConfig = { view: 'list' };
      initConfig(makeElement({ 'data-view': 'map' }));
      expect(config.view).toBe('map');
    });

    test('invalid data-view falls through to CrumbWidgetConfig.view', () => {
      window.CrumbWidgetConfig = { view: 'both' };
      initConfig(makeElement({ 'data-view': 'not-a-view' }));
      expect(config.view).toBe('both');
    });

    test('no data-view uses CrumbWidgetConfig.view', () => {
      window.CrumbWidgetConfig = { view: 'both' };
      initConfig(makeElement());
      expect(config.view).toBe('both');
    });
  });

  describe('raw query', () => {
    test('defaults config.query to undefined', () => {
      initConfig(makeElement());
      expect(config.query).toBeUndefined();
    });

    test('reads data-query attribute', () => {
      initConfig(makeElement({ 'data-query': 'meeting_key=location_nation&meeting_key_value[]=USA' }));
      expect(config.query).toBe('meeting_key=location_nation&meeting_key_value[]=USA');
    });

    test('reads CrumbWidgetConfig.query', () => {
      window.CrumbWidgetConfig = { query: 'weekdays=2' };
      initConfig(makeElement());
      expect(config.query).toBe('weekdays=2');
    });

    test('data-query attribute overrides CrumbWidgetConfig.query', () => {
      window.CrumbWidgetConfig = { query: 'weekdays=2' };
      initConfig(makeElement({ 'data-query': 'weekdays=6' }));
      expect(config.query).toBe('weekdays=6');
    });

    test('forces geolocation off when a custom query is set, even on the unconstrained aggregator', () => {
      initConfig(makeElement({ 'data-server': 'https://aggregator.bmltenabled.org/main_server/', 'data-query': 'weekdays=2' }));
      expect(config.geolocation).toBe(false);
    });

    test('forces geolocation off even when CrumbWidgetConfig.geolocation=true', () => {
      window.CrumbWidgetConfig = { geolocation: true, query: 'weekdays=2' };
      initConfig(makeElement());
      expect(config.geolocation).toBe(false);
    });

    test('geolocation default is unaffected when query is absent', () => {
      initConfig(makeElement({ 'data-server': 'https://aggregator.bmltenabled.org/main_server/' }));
      expect(config.geolocation).toBe(true);
    });
  });

  describe('geolocation data attribute', () => {
    test('data-geolocation="true" enables geolocation', () => {
      initConfig(makeElement({ 'data-geolocation': 'true' }));
      expect(config.geolocation).toBe(true);
    });

    test('data-geolocation="1" enables geolocation', () => {
      initConfig(makeElement({ 'data-geolocation': '1' }));
      expect(config.geolocation).toBe(true);
    });

    test('data-geolocation="false" disables aggregator default', () => {
      initConfig(makeElement({ 'data-server': 'https://aggregator.bmltenabled.org/main_server/', 'data-geolocation': 'false' }));
      expect(config.geolocation).toBe(false);
    });

    test('data-geolocation overrides CrumbWidgetConfig.geolocation', () => {
      window.CrumbWidgetConfig = { geolocation: false };
      initConfig(makeElement({ 'data-geolocation': 'true' }));
      expect(config.geolocation).toBe(true);
    });

    test('data-geolocation is forced off by a custom query', () => {
      initConfig(makeElement({ 'data-geolocation': 'true', 'data-query': 'weekdays=2' }));
      expect(config.geolocation).toBe(false);
    });
  });
});
