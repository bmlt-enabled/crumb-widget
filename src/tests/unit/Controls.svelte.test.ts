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
  serverUrl: 'https://test.example.org/main_server',
  serviceBodyIds: [],
  formatIds: [],
  formatKeys: [],
  view: 'list',
  containerId: 'crumb-widget',
  columns: ['time', 'name', 'location', 'address'],
  geolocation: false,
  geolocationRadius: 75,
  distanceOptions: [5, 10, 15, 25, 50, 100],
  distanceUnit: 'mi',
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
  uiState.userLocation = undefined;
  uiState.geoRadius = 0;
  config.geolocation = false;
  config.serviceBodyIds = [];
  config.serverUrl = 'https://test.example.org/main_server';
  config.geolocationRadius = 75;
  config.distanceOptions = [5, 10, 15, 25, 50, 100];
  config.distanceUnit = 'mi';
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

  test('hides view toggle when view is both', () => {
    dataState.meetings = [makeMeeting({ venue_type: 1, isInPerson: true })];
    config.view = 'both';
    render(App, { props: { config: baseConfig } });
    expect(screen.queryByTitle('List view')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Map view')).not.toBeInTheDocument();
    config.view = 'list';
  });
});

describe('both view', () => {
  beforeEach(() => {
    config.view = 'both';
  });

  afterEach(() => {
    config.view = 'list';
  });

  test('shows meeting list content in both view', () => {
    dataState.meetings = [makeMeeting({ meeting_name: 'Monday Night Meeting', venue_type: 1, isInPerson: true })];
    uiState.view = 'both';
    render(App, { props: { config: baseConfig } });
    expect(screen.getAllByText('Monday Night Meeting')[0]).toBeInTheDocument();
  });

  test('shows map container in both view', () => {
    dataState.meetings = [makeMeeting({ venue_type: 1, isInPerson: true })];
    uiState.view = 'both';
    render(App, { props: { config: baseConfig } });
    expect(document.querySelector('.bmlt-map-container')).toBeInTheDocument();
  });

  test('shows both map and meeting list simultaneously', () => {
    dataState.meetings = [makeMeeting({ meeting_name: 'Monday Night Meeting', venue_type: 1, isInPerson: true })];
    uiState.view = 'both';
    render(App, { props: { config: baseConfig } });
    expect(document.querySelector('.bmlt-map-container')).toBeInTheDocument();
    expect(screen.getAllByText('Monday Night Meeting')[0]).toBeInTheDocument();
  });

  test('initializes to both view on mount when geolocation is disabled', async () => {
    render(App, { props: { config: { ...baseConfig, view: 'both', geolocation: false } } });
    await waitFor(() => expect(uiState.view).toBe('both'));
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
    expect(screen.getByText(/2 selected/)).toBeInTheDocument();
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
    await fireEvent.click(screen.getByText('75 mi'));
    await waitFor(() => expect(screen.getByText('Locating…')).toBeInTheDocument());
  });

  test('shows Near Me after successful geolocation', async () => {
    mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 34.05, longitude: -118.24, accuracy: 10 } } as GeolocationPosition);
    });
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    await fireEvent.click(screen.getByText('75 mi'));
    await waitFor(() => expect(screen.getByText(/Near Me/)).toBeInTheDocument());
    expect(uiState.geoActive).toBe(true);
  });

  test('shows location denied error when permission is denied', async () => {
    mockGetCurrentPosition.mockImplementation((_success: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 1, message: 'Denied' } as GeolocationPositionError);
    });
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    await fireEvent.click(screen.getByText('75 mi'));
    await waitFor(() => expect(screen.getByText('Location access denied')).toBeInTheDocument());
  });

  test('shows generic location error for non-permission failures', async () => {
    mockGetCurrentPosition.mockImplementation((_success: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 2, message: 'Position unavailable' } as GeolocationPositionError);
    });
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    await fireEvent.click(screen.getByText('75 mi'));
    await waitFor(() => expect(screen.getByText('Location unavailable')).toBeInTheDocument());
  });

  test('shows error when geolocation API is unavailable', async () => {
    // Remove the geolocation API entirely for this test
    Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true });
    render(App, { props: { config: { ...baseConfig, geolocation: true } } });
    await waitFor(() => expect(dataState.error).toBe('Unable to get location'));
  });

  test('shows custom distanceOptions in dropdown', async () => {
    config.distanceOptions = [5, 10, 20];
    config.geolocationRadius = 20;
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    expect(screen.getByText('5 mi')).toBeInTheDocument();
    expect(screen.getByText('10 mi')).toBeInTheDocument();
    expect(screen.getByText('20 mi')).toBeInTheDocument();
    expect(screen.queryByText('50 mi')).not.toBeInTheDocument();
  });

  test('caps dropdown at geolocationRadius', async () => {
    config.distanceOptions = [5, 10, 15, 25, 50, 100];
    config.geolocationRadius = 10;
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    expect(screen.getByText('5 mi')).toBeInTheDocument();
    expect(screen.getByText('10 mi')).toBeInTheDocument();
    expect(screen.queryByText('25 mi')).not.toBeInTheDocument();
  });

  test('appends geolocationRadius when not in distanceOptions', async () => {
    config.distanceOptions = [5, 10, 25];
    config.geolocationRadius = 30;
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    expect(screen.getByText('25 mi')).toBeInTheDocument();
    expect(screen.getByText('30 mi')).toBeInTheDocument();
    expect(screen.queryByText('50 mi')).not.toBeInTheDocument();
  });

  test('shows km unit when distanceUnit is km', async () => {
    config.distanceUnit = 'km';
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    expect(screen.getAllByText(/\d+ km/).length).toBeGreaterThan(0);
  });

  test('shows checkmark next to the active radius in dropdown', async () => {
    mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 34.05, longitude: -118.24, accuracy: 10 } } as GeolocationPosition);
    });
    dataState.meetings = [makeMeeting()];
    const { container } = render(App, { props: { config: baseConfig } });
    // Select 5 mi
    await fireEvent.click(screen.getByText('Anywhere'));
    await fireEvent.click(screen.getByText('5 mi'));
    // Wait for "Near Me · 5 mi" label to appear (geoStatus transitions to 'active')
    const nearMeBtn = await waitFor(() => screen.getByText(/Near Me/));
    // Re-open the dropdown — the active option should show the checkmark SVG (d="M5 13l4 4L19 7")
    await fireEvent.click(nearMeBtn);
    expect(container.querySelector('path[d="M5 13l4 4L19 7"]')).toBeInTheDocument();
  });

  test('shows X clear button when geoActive and serviceBodyIds is set', async () => {
    config.serviceBodyIds = [1];
    mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 34.05, longitude: -118.24, accuracy: 10 } } as GeolocationPosition);
    });
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    await fireEvent.click(screen.getByText('75 mi'));
    await waitFor(() => expect(screen.getByLabelText('Clear location filter')).toBeInTheDocument());
  });

  test('clicking X clear button deactivates geo', async () => {
    config.serviceBodyIds = [1];
    mockGetCurrentPosition.mockImplementation((success: PositionCallback) => {
      success({ coords: { latitude: 34.05, longitude: -118.24, accuracy: 10 } } as GeolocationPosition);
    });
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Anywhere'));
    await fireEvent.click(screen.getByText('75 mi'));
    await waitFor(() => expect(uiState.geoActive).toBe(true));
    await fireEvent.click(screen.getByLabelText('Clear location filter'));
    expect(uiState.geoActive).toBe(false);
  });
});

describe('active filter chips', () => {
  test('no chips row when no filters are active', () => {
    dataState.meetings = [makeMeeting()];
    render(App, { props: { config: baseConfig } });
    expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument();
  });

  test('shows a chip and clear all when a weekday filter is active', async () => {
    dataState.meetings = [makeMeeting({ weekday_tinyint: 2 })];
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Any Day'));
    await fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
    expect(screen.getByText('Monday', { selector: '[class*="rounded-full"]' })).toBeInTheDocument();
    expect(screen.getByText('Clear all filters')).toBeInTheDocument();
  });

  test('clicking a chip removes that filter', async () => {
    dataState.meetings = [makeMeeting({ weekday_tinyint: 2 })];
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Any Day'));
    await fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
    expect(uiState.filters.weekdays).toContain(2);
    // Close the dropdown by clicking outside, then click the chip
    await fireEvent.click(document.body);
    const chip = screen.getAllByRole('button').find((b) => b.classList.contains('rounded-full') && b.textContent?.includes('Monday'));
    await fireEvent.click(chip!);
    expect(uiState.filters.weekdays).not.toContain(2);
  });

  test('clicking Clear all filters removes all chips', async () => {
    dataState.meetings = [makeMeeting({ weekday_tinyint: 2 })];
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Any Day'));
    await fireEvent.click(screen.getByRole('button', { name: 'Monday' }));
    await fireEvent.click(screen.getByText('Clear all filters'));
    expect(uiState.filters.weekdays).toHaveLength(0);
    expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument();
  });

  test('shows venue type chip when venue filter is active', async () => {
    dataState.meetings = [makeMeeting({ venue_type: 1, isInPerson: true })];
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getByText('Any Format'));
    await fireEvent.click(screen.getByRole('button', { name: 'In-Person' }));
    expect(screen.getByText('In-Person', { selector: 'button *' })).toBeInTheDocument();
  });
});

describe('format type dropdown grouping', () => {
  function makeFormat(id: string, name: string, type?: string) {
    return { id, key_string: id, name_string: name, description_string: '', lang: 'en', format_type_enum: type };
  }

  async function openTypeDropdown() {
    await fireEvent.click(screen.getByText('Any Format'));
  }

  test('shows no group headers when all formats lack a type', async () => {
    const fmt = makeFormat('1', 'Open');
    dataState.meetings = [makeMeeting({ resolvedFormats: [fmt] })];
    render(App, { props: { config: baseConfig } });
    await openTypeDropdown();
    expect(screen.queryByText('Meeting Format')).not.toBeInTheDocument();
    expect(screen.queryByText('Other')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  test('shows no group header when there is only one group', async () => {
    // Legacy code 'O' = OPEN_OR_CLOSED
    const fmt = makeFormat('1', 'Open', 'O');
    dataState.meetings = [makeMeeting({ resolvedFormats: [fmt] })];
    render(App, { props: { config: baseConfig } });
    await openTypeDropdown();
    expect(screen.queryByText('Open or Closed')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  test('shows group headers when formats span multiple legacy type codes', async () => {
    // FC1 = MEETING_FORMAT, O = OPEN_OR_CLOSED
    const f1 = makeFormat('1', 'Open', 'O');
    const f2 = makeFormat('2', 'Speaker', 'FC1');
    dataState.meetings = [makeMeeting({ resolvedFormats: [f1, f2] })];
    render(App, { props: { config: baseConfig } });
    await openTypeDropdown();
    expect(screen.getByText('Meeting Format')).toBeInTheDocument();
    expect(screen.getByText('Open or Closed')).toBeInTheDocument();
  });

  test('maps all legacy codes to canonical group names', async () => {
    const f1 = makeFormat('1', 'Discussion', 'FC1'); // MEETING_FORMAT
    const f2 = makeFormat('2', 'Wheelchair', 'FC2'); // LOCATION
    const f3 = makeFormat('3', 'Men', 'FC3'); // COMMON_NEEDS_OR_RESTRICTION
    const f4 = makeFormat('4', 'Open', 'O'); // OPEN_OR_CLOSED
    const f5 = makeFormat('5', 'Spanish', 'LANG'); // LANGUAGE
    dataState.meetings = [makeMeeting({ resolvedFormats: [f1, f2, f3, f4, f5] })];
    render(App, { props: { config: baseConfig } });
    await openTypeDropdown();
    expect(screen.getByText('Meeting Format')).toBeInTheDocument();
    expect(screen.getByText('Open or Closed')).toBeInTheDocument();
    expect(screen.getByText('Common Needs or Restriction')).toBeInTheDocument();
    expect(screen.getAllByText('Location').length).toBeGreaterThan(0);
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  test('groups appear in canonical order (OPEN_OR_CLOSED before MEETING_FORMAT before LANGUAGE)', async () => {
    const f1 = makeFormat('1', 'Spanish', 'LANG');
    const f2 = makeFormat('2', 'Open', 'O');
    const f3 = makeFormat('3', 'Speaker', 'FC1');
    dataState.meetings = [makeMeeting({ resolvedFormats: [f1, f2, f3] })];
    render(App, { props: { config: baseConfig } });
    await openTypeDropdown();
    const headers = screen.getAllByText(/Open or Closed|Meeting Format|Language/);
    expect(headers[0]).toHaveTextContent('Open or Closed');
    expect(headers[1]).toHaveTextContent('Meeting Format');
    expect(headers[2]).toHaveTextContent('Language');
  });

  test('shows Venue Type header above in-person/virtual options', async () => {
    dataState.meetings = [makeMeeting()];
    render(App, { props: { config: baseConfig } });
    await openTypeDropdown();
    expect(screen.getByText('Venue Type')).toBeInTheDocument();
  });

  test('formats within a group are sorted alphabetically', async () => {
    const f1 = makeFormat('1', 'Zeta', 'FC1');
    const f2 = makeFormat('2', 'Alpha', 'FC1');
    const f3 = makeFormat('3', 'Open', 'O');
    dataState.meetings = [makeMeeting({ resolvedFormats: [f1, f2, f3] })];
    render(App, { props: { config: baseConfig } });
    await openTypeDropdown();
    const buttons = screen.getAllByRole('button', { name: /Alpha|Zeta/ });
    expect(buttons[0]).toHaveTextContent('Alpha');
    expect(buttons[1]).toHaveTextContent('Zeta');
  });

  test('formats with unknown type land in Other group', async () => {
    const f1 = makeFormat('1', 'Open', 'O');
    const f2 = makeFormat('2', 'Weird', 'UNKNOWN_TYPE');
    dataState.meetings = [makeMeeting({ resolvedFormats: [f1, f2] })];
    render(App, { props: { config: baseConfig } });
    await openTypeDropdown();
    expect(screen.getByText('Other')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Weird' })).toBeInTheDocument();
  });

  test('clicking a format in a group toggles the filter', async () => {
    const fmt = makeFormat('5', 'Open', 'O');
    dataState.meetings = [makeMeeting({ resolvedFormats: [fmt] })];
    render(App, { props: { config: baseConfig } });
    await openTypeDropdown();
    await fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(uiState.filters.formatIds).toContain('5');
  });
});
