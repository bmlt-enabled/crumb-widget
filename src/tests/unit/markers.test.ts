import { describe, test, expect } from 'vitest';
import L from 'leaflet';
import { buildMarkerIcon, DEFAULT_LOCATION_MARKER } from '@utils/markers';

describe('buildMarkerIcon', () => {
  test('returns a Leaflet DivIcon instance', () => {
    const icon = buildMarkerIcon({ html: '<span>X</span>', width: 23, height: 33 });
    expect(icon).toBeInstanceOf(L.DivIcon);
  });

  test('sets html from config', () => {
    const icon = buildMarkerIcon({ html: '<b>marker</b>', width: 10, height: 20 });
    expect(icon.options.html).toBe('<b>marker</b>');
  });

  test('sets iconSize from width and height', () => {
    const icon = buildMarkerIcon({ html: '', width: 23, height: 33 });
    const size = icon.options.iconSize as L.Point;
    expect(size.x).toBe(23);
    expect(size.y).toBe(33);
  });

  test('sets iconAnchor to [floor(width/2), height] for odd width', () => {
    const icon = buildMarkerIcon({ html: '', width: 23, height: 33 });
    expect(icon.options.iconAnchor).toEqual([11, 33]); // floor(23/2) = 11
  });

  test('sets iconAnchor to [width/2, height] for even width', () => {
    const icon = buildMarkerIcon({ html: '', width: 24, height: 40 });
    expect(icon.options.iconAnchor).toEqual([12, 40]);
  });

  test('sets popupAnchor to [0, -height]', () => {
    const icon = buildMarkerIcon({ html: '', width: 23, height: 33 });
    expect(icon.options.popupAnchor).toEqual([0, -33]);
  });

  test('sets className to bmlt-marker', () => {
    const icon = buildMarkerIcon({ html: '', width: 23, height: 33 });
    expect(icon.options.className).toBe('bmlt-marker');
  });

  test('uses provided html verbatim', () => {
    const html = '<img src="data:image/png;base64,abc" />';
    const icon = buildMarkerIcon({ html, width: 10, height: 10 });
    expect(icon.options.html).toBe(html);
  });
});

describe('DEFAULT_LOCATION_MARKER', () => {
  test('has expected dimensions', () => {
    expect(DEFAULT_LOCATION_MARKER.width).toBe(23);
    expect(DEFAULT_LOCATION_MARKER.height).toBe(33);
  });

  test('html contains an img element', () => {
    expect(DEFAULT_LOCATION_MARKER.html).toContain('<img');
  });

  test('buildMarkerIcon works with the default marker config', () => {
    const icon = buildMarkerIcon(DEFAULT_LOCATION_MARKER);
    expect(icon).toBeInstanceOf(L.DivIcon);
    const size = icon.options.iconSize as L.Point;
    expect(size.x).toBe(23);
    expect(size.y).toBe(33);
  });
});
