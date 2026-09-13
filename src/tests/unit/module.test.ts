import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Prevent real API calls when mountCrumbWidget mounts the app.
vi.mock('@stores/data.svelte', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@stores/data.svelte')>();
  return { ...actual, loadData: vi.fn(), loadVirtualData: vi.fn(), loadDataByAddress: vi.fn(), loadDataByCoordinates: vi.fn() };
});

// App statically imports MeetingDetail/MapView, which import leaflet at module load.
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({ setView: vi.fn().mockReturnThis(), remove: vi.fn(), invalidateSize: vi.fn(), on: vi.fn().mockReturnThis() })),
    marker: vi.fn(() => ({ bindPopup: vi.fn().mockReturnThis(), addTo: vi.fn().mockReturnThis(), openPopup: vi.fn().mockReturnThis(), getElement: vi.fn(() => document.createElement('div')) })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn().mockReturnThis(), remove: vi.fn() })),
    divIcon: vi.fn(() => ({})),
    DivIcon: vi.fn(),
    Point: vi.fn()
  }
}));

import { mountCrumbWidget } from '@/module';
import { config } from '@stores/config.svelte';

let el: HTMLElement;

beforeEach(() => {
  config.virtual = false;
  el = document.createElement('div');
  document.body.appendChild(el);
});

afterEach(() => {
  el.remove();
  vi.restoreAllMocks();
});

describe('mountCrumbWidget', () => {
  test('applies serverUrl and sensible defaults', () => {
    el.id = 'widget-a';
    mountCrumbWidget(el, { serverUrl: 'https://bmlt.example.org/main_server/' });
    expect(config.serverUrl).toBe('https://bmlt.example.org/main_server/');
    expect(config.containerId).toBe('widget-a');
    expect(config.view).toBe('list');
    expect(config.virtual).toBe(false);
  });

  test('serviceBodyIds and options flow through', () => {
    mountCrumbWidget(el, { serverUrl: 'https://bmlt.example.org/main_server/', serviceBodyIds: [1, 2], hideHeader: true });
    expect(config.serviceBodyIds).toEqual([1, 2]);
    expect(config.hideHeader).toBe(true);
  });

  test('virtual option forces list view and disables geolocation', () => {
    mountCrumbWidget(el, { serverUrl: 'https://aggregator.bmltenabled.org/main_server/', virtual: true, view: 'map', geolocation: true });
    expect(config.virtual).toBe(true);
    expect(config.view).toBe('list');
    expect(config.geolocation).toBe(false);
  });
});
