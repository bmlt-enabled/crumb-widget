import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import App from '@/App.svelte';
import type { AppConfig, ProcessedMeeting } from '@/types/index';
import { dataState } from '@stores/data.svelte';
import { uiState, resetFilters } from '@stores/ui.svelte';
import { config } from '@stores/config.svelte';

// Prevent real API calls
vi.mock('@stores/data.svelte', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@stores/data.svelte')>();
  return { ...actual, loadData: vi.fn(), loadDataByCoordinates: vi.fn().mockResolvedValue(undefined) };
});

vi.mock('@bmlt-enabled/svelte-spa-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@bmlt-enabled/svelte-spa-router')>();
  return {
    ...actual,
    push: vi.fn((path: string) => {
      window.location.hash = path.startsWith('#') ? path : '#' + path;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }),
    pop: vi.fn(() => {
      window.location.hash = '#/';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    })
  };
});

// App props — geolocation: false keeps App.svelte from auto-geolocating on mount.
// The geolocation button in Controls is controlled separately via the config store.
const baseConfig: AppConfig = {
  rootServerUrl: 'https://test.example.org/main_server',
  serviceBodyIds: [],
  defaultView: 'list',
  containerId: 'crumb-widget',
  columns: ['time', 'name', 'location', 'address'],
  geolocation: false,
  geolocationRadius: 10,
  height: 600
};

function makeMeeting(overrides: Partial<ProcessedMeeting> = {}): ProcessedMeeting {
  return {
    id_bigint: '1',
    weekday_tinyint: 2,
    venue_type: 1,
    start_time: '19:00:00',
    duration_time: '01:00:00',
    meeting_name: 'Monday Night Meeting',
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
  dataState.meetings = [];
  dataState.loading = false;
  dataState.error = null;
  resetFilters();
  uiState.view = 'list';
  uiState.geoActive = false;
  config.geolocation = false;
  config.serviceBodyIds = [];
  config.rootServerUrl = 'https://test.example.org/main_server';
  config.geolocationRadius = 10;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('view toggle', () => {
  test('shows list/map toggle when there are in-person meetings', () => {
    dataState.meetings = [makeMeeting({ venue_type: 1, isInPerson: true })];
    render(App, { props: { config: baseConfig } });
    expect(screen.getByTitle('List view')).toBeInTheDocument();
    expect(screen.getByTitle('Map view')).toBeInTheDocument();
  });

  test('does not show view toggle when all meetings are virtual', () => {
    dataState.meetings = [makeMeeting({ venue_type: 2, isInPerson: false, isVirtual: true })];
    render(App, { props: { config: baseConfig } });
    expect(screen.queryByTitle('List view')).not.toBeInTheDocument();
  });

  test('clicking Map switches view to map', async () => {
    dataState.meetings = [makeMeeting({ venue_type: 1, isInPerson: true })];
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByTitle('Map view'));
    expect(uiState.view).toBe('map');
  });

  test('clicking List switches back from map', async () => {
    dataState.meetings = [makeMeeting({ venue_type: 1, isInPerson: true })];
    uiState.view = 'map';
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByTitle('List view'));
    expect(uiState.view).toBe('list');
  });
});

describe('day dropdown', () => {
  test('shows Any Day when no weekday filter is set', () => {
    dataState.meetings = [makeMeeting()];
    render(App, { props: { config: baseConfig } });
    expect(screen.getByText('Any Day')).toBeInTheDocument();
  });

  test('updates button label to day name when one weekday is selected', async () => {
    dataState.meetings = [makeMeeting({ weekday_tinyint: 2, meeting_name: 'Monday Meeting' })];
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Any Day'));
    await fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
    // The toggle button (formerly "Any Day") now reads "Monday"
    expect(screen.queryByText('Any Day')).not.toBeInTheDocument();
    expect(uiState.filters.weekdays).toContain(2);
  });

  test('shows count when multiple weekdays are selected', async () => {
    dataState.meetings = [makeMeeting({ id_bigint: '1', weekday_tinyint: 2, meeting_name: 'Monday' }), makeMeeting({ id_bigint: '2', weekday_tinyint: 4, meeting_name: 'Wednesday' })];
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Any Day'));
    await fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Wednesday' }));
    expect(screen.getByText(/2 Day/)).toBeInTheDocument();
  });

  test('opening day dropdown closes time dropdown', async () => {
    dataState.meetings = [makeMeeting()];
    render(App, { props: { config: baseConfig } });
    // Open time dropdown first
    await fireEvent.click(screen.getByText('Any Time'));
    expect(screen.getByRole('button', { name: 'Morning' })).toBeInTheDocument();
    // Open day dropdown — time dropdown should close
    await fireEvent.click(screen.getByText('Any Day'));
    expect(screen.queryByRole('button', { name: 'Morning' })).not.toBeInTheDocument();
  });
});

describe('time of day dropdown', () => {
  test('shows Any Time when no time filter is set', () => {
    dataState.meetings = [makeMeeting()];
    render(App, { props: { config: baseConfig } });
    expect(screen.getByText('Any Time')).toBeInTheDocument();
  });

  test('filters by morning time of day', async () => {
    dataState.meetings = [
      makeMeeting({ id_bigint: '1', meeting_name: 'Morning Group', timeOfDay: 'morning', formattedTime: '9:00 AM' }),
      makeMeeting({ id_bigint: '2', meeting_name: 'Night Owls', timeOfDay: 'night', formattedTime: '11:00 PM' })
    ];
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Any Time'));
    await fireEvent.click(screen.getByRole('button', { name: 'Morning' }));
    expect(screen.getAllByText('Morning Group')[0]).toBeInTheDocument();
    expect(screen.queryByText('Night Owls')).not.toBeInTheDocument();
  });

  test('opening time dropdown closes day dropdown', async () => {
    dataState.meetings = [makeMeeting()];
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Any Day'));
    expect(screen.getByRole('button', { name: 'Monday' })).toBeInTheDocument();
    // Open time dropdown — day dropdown should close
    await fireEvent.click(screen.getByText('Any Time'));
    expect(screen.queryByRole('button', { name: 'Monday' })).not.toBeInTheDocument();
  });
});

describe('geolocation button', () => {
  // jsdom doesn't include navigator.geolocation, so we install a mock object
  const mockGetCurrentPosition = vi.fn();

  beforeEach(() => {
    config.geolocation = true;
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
      writable: true
    });
    mockGetCurrentPosition.mockReset();
  });

  test('shows Anywhere button when geolocation is enabled', () => {
    render(App, { props: { config: baseConfig } });
    expect(screen.getByText('Anywhere')).toBeInTheDocument();
  });

  test('shows Locating… while waiting for a position response', async () => {
    // Never call the callback — hold the locating state
    mockGetCurrentPosition.mockImplementation(() => {});
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    await waitFor(() => expect(screen.getByText('Locating…')).toBeInTheDocument());
  });

  test('shows Near Me after successful geolocation', async () => {
    mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 34.05, longitude: -118.24, accuracy: 10 } } as GeolocationPosition);
    });
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    await waitFor(() => expect(screen.getByText('Near Me')).toBeInTheDocument());
    expect(uiState.geoActive).toBe(true);
  });

  test('shows location denied error when permission is denied', async () => {
    mockGetCurrentPosition.mockImplementation((_success: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, message: 'Denied' } as GeolocationPositionError);
    });
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    await waitFor(() => expect(screen.getByText('Location access denied')).toBeInTheDocument());
  });

  test('shows generic location error for non-permission failures', async () => {
    mockGetCurrentPosition.mockImplementation((_success: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 2, message: 'Position unavailable' } as GeolocationPositionError);
    });
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    await waitFor(() => expect(screen.getByText('Location unavailable')).toBeInTheDocument());
  });

  test('shows error when geolocation API is unavailable', async () => {
    // Remove the geolocation API entirely for this test
    Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true });
    render(App, { props: { config: { ...baseConfig, geolocation: true } } });
    await waitFor(() => expect(dataState.error).toBe('Unable to get location'));
  });
});
