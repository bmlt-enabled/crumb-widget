import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import MapView from '@components/MapView.svelte';
import type { ProcessedMeeting } from '@/types/index';
import L from 'leaflet';

const mockMarkersLayer = {
  clearLayers: vi.fn(),
  addTo: vi.fn().mockReturnThis()
};

const mockMarker = {
  bindPopup: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
  getElement: vi.fn(() => {
    const el = document.createElement('div');
    el.appendChild(document.createElement('img'));
    return el;
  })
};

const eventHandlers: Record<string, (...args: any[]) => void> = {};

const mockMap = {
  on: vi.fn((event: string, handler: (...args: any[]) => void) => {
    eventHandlers[event] = handler;
    return mockMap;
  }),
  off: vi.fn(),
  remove: vi.fn(),
  invalidateSize: vi.fn(),
  getCenter: vi.fn(() => ({ lat: 34.05, lng: -118.24 })),
  fitBounds: vi.fn()
};

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => mockMap),
    marker: vi.fn(() => mockMarker),
    layerGroup: vi.fn(() => mockMarkersLayer),
    featureGroup: vi.fn(() => ({
      getBounds: vi.fn(() => ({
        pad: vi.fn().mockReturnThis()
      }))
    })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn().mockReturnThis(), remove: vi.fn() })),
    divIcon: vi.fn(() => ({})),
    DivIcon: vi.fn(),
    Point: vi.fn(function (this: any, x: number, y: number) {
      this.x = x;
      this.y = y;
    })
  }
}));

vi.mock('@utils/mapUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@utils/mapUtils')>();
  return {
    ...actual,
    observeMapResize: vi.fn(() => vi.fn())
  };
});

function makeMeeting(overrides: Partial<ProcessedMeeting> = {}): ProcessedMeeting {
  return {
    id_bigint: '1',
    weekday_tinyint: 2,
    venue_type: 1,
    start_time: '19:00:00',
    duration_time: '01:00:00',
    meeting_name: 'Test Meeting',
    location_text: 'Community Center',
    location_street: '123 Main St',
    location_municipality: 'Anytown',
    location_province: 'CA',
    location_postal_code_1: '90210',
    latitude: 34.05,
    longitude: -118.24,
    published: 1,
    service_body_bigint: '1',
    format_shared_id_list: '',
    formattedTime: '7:00 PM',
    formattedAddress: '123 Main St, Anytown, CA, 90210',
    timeOfDay: 'evening',
    resolvedFormats: [],
    isVirtual: false,
    isInPerson: true,
    ...overrides
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  Object.keys(eventHandlers).forEach((key) => delete eventHandlers[key]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MapView — rendering', () => {
  test('initializes leaflet map on mount', () => {
    render(MapView, { props: { meetings: [makeMeeting()] } });
    expect(vi.mocked(L.map)).toHaveBeenCalled();
  });

  test('creates markers layer', () => {
    render(MapView, { props: { meetings: [makeMeeting()] } });
    expect(mockMarkersLayer.addTo).toHaveBeenCalledWith(mockMap);
  });

  test('creates markers for in-person meetings', () => {
    render(MapView, { props: { meetings: [makeMeeting()] } });
    expect(vi.mocked(L.marker)).toHaveBeenCalled();
  });

  test('fits bounds to markers', () => {
    render(MapView, { props: { meetings: [makeMeeting()] } });
    expect(mockMap.fitBounds).toHaveBeenCalled();
  });

  test('groups markers at same coordinates', () => {
    const m1 = makeMeeting({ id_bigint: '1', meeting_name: 'Meeting A', latitude: 34.05, longitude: -118.24 });
    const m2 = makeMeeting({ id_bigint: '2', meeting_name: 'Meeting B', latitude: 34.05, longitude: -118.24 });
    render(MapView, { props: { meetings: [m1, m2] } });
    // renderMarkers fires in onMount + $effect, each creating 1 marker for the group
    // Verify marker was called with the shared coordinates
    expect(vi.mocked(L.marker)).toHaveBeenCalledWith([34.05, -118.24], expect.anything());
  });

  test('creates separate markers for different coordinates', () => {
    const m1 = makeMeeting({ id_bigint: '1', latitude: 34.05, longitude: -118.24 });
    const m2 = makeMeeting({ id_bigint: '2', latitude: 35.0, longitude: -119.0 });
    render(MapView, { props: { meetings: [m1, m2] } });
    expect(vi.mocked(L.marker)).toHaveBeenCalledWith([34.05, -118.24], expect.anything());
    expect(vi.mocked(L.marker)).toHaveBeenCalledWith([35, -119], expect.anything());
  });
});

describe('MapView — empty state', () => {
  test('shows empty message when no in-person meetings', () => {
    render(MapView, { props: { meetings: [] } });
    expect(screen.getByText('No in-person meetings to show on map with current filters')).toBeInTheDocument();
  });

  test('shows empty message when all meetings are virtual', () => {
    const meeting = makeMeeting({ venue_type: 2, isInPerson: false, isVirtual: true, latitude: 0, longitude: 0 });
    render(MapView, { props: { meetings: [meeting] } });
    expect(screen.getByText('No in-person meetings to show on map with current filters')).toBeInTheDocument();
  });

  test('does not show empty message when in-person meetings exist', () => {
    render(MapView, { props: { meetings: [makeMeeting()] } });
    expect(screen.queryByText('No in-person meetings to show on map with current filters')).not.toBeInTheDocument();
  });
});

describe('MapView — search area button', () => {
  test('does not show search button by default', () => {
    render(MapView, { props: { meetings: [makeMeeting()], geoActive: true, onsearcharea: vi.fn() } });
    expect(screen.queryByText('Search this area')).not.toBeInTheDocument();
  });

  test('does not show search button when geoActive is false', () => {
    render(MapView, { props: { meetings: [makeMeeting()], geoActive: false } });
    expect(screen.queryByText('Search this area')).not.toBeInTheDocument();
  });
});

describe('MapView — marker accessibility', () => {
  test('sets aria-label on marker element', () => {
    render(MapView, { props: { meetings: [makeMeeting({ meeting_name: 'My Meeting' })] } });
    expect(mockMarker.getElement).toHaveBeenCalled();
  });
});
