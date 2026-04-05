import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import App from '@/App.svelte';
import type { AppConfig, Format } from '@/types/index';
import { dataState, loadDataByCoordinates } from '@stores/data.svelte';
import { uiState, resetFilters } from '@stores/ui.svelte';
import type { ProcessedMeeting } from '@/types/index';

// Prevent real API calls in all tests
vi.mock('@stores/data.svelte', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@stores/data.svelte')>();
  return {
    ...actual,
    loadData: vi.fn(),
    loadDataByCoordinates: vi.fn()
  };
});

// Make push/pop synchronous in tests — the real push() awaits tick() before
// setting the hash, which breaks fireEvent-based assertions.
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

function makeFormat(overrides: Partial<Format> = {}): Format {
  return {
    id: '1',
    key_string: 'O',
    name_string: 'Open',
    description_string: 'Open to all',
    lang: 'en',
    ...overrides
  };
}

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
});

describe('App', () => {
  test('renders header', () => {
    render(App, { props: { config: baseConfig } });
    expect(screen.getByText('Meeting Finder')).toBeInTheDocument();
  });

  test('shows loading spinner while loading', () => {
    dataState.loading = true;
    render(App, { props: { config: baseConfig } });
    expect(screen.getByText('Loading meetings…')).toBeInTheDocument();
  });

  test('shows error message on failure', () => {
    dataState.error = 'Network error';
    render(App, { props: { config: baseConfig } });
    expect(screen.getByText('Error loading meetings')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  test('shows meeting list when data is loaded', () => {
    dataState.meetings = [makeMeeting()];
    render(App, { props: { config: baseConfig } });
    expect(screen.getAllByText('Monday Night Meeting')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Mon')[0]).toBeInTheDocument();
    expect(screen.getAllByText('7:00 PM')[0]).toBeInTheDocument();
  });

  test('shows meeting count in header', () => {
    dataState.meetings = [makeMeeting(), makeMeeting({ id_bigint: '2', meeting_name: 'Second Meeting' })];
    render(App, { props: { config: baseConfig } });
    expect(screen.getByText('2 meetings')).toBeInTheDocument();
  });

  test('shows no results message when list is empty', () => {
    dataState.meetings = [];
    render(App, { props: { config: baseConfig } });
    expect(screen.getByText('No meetings found')).toBeInTheDocument();
  });
});

describe('filtering', () => {
  test('filters meetings by weekday', async () => {
    dataState.meetings = [makeMeeting({ id_bigint: '1', meeting_name: 'Monday Meeting', weekday_tinyint: 2 }), makeMeeting({ id_bigint: '2', meeting_name: 'Wednesday Meeting', weekday_tinyint: 4 })];
    render(App, { props: { config: baseConfig } });

    // Open the Any Day dropdown and click Monday
    await fireEvent.click(screen.getByText('Any Day'));
    await fireEvent.click(screen.getByRole('button', { name: 'Monday' }));

    expect(screen.getAllByText('Monday Meeting')[0]).toBeInTheDocument();
    expect(screen.queryByText('Wednesday Meeting')).not.toBeInTheDocument();
  });

  test('filters meetings by venue type', async () => {
    dataState.meetings = [
      makeMeeting({ id_bigint: '1', meeting_name: 'In-Person Group', venue_type: 1, isInPerson: true, isVirtual: false }),
      makeMeeting({ id_bigint: '2', meeting_name: 'Zoom Group', venue_type: 2, isInPerson: false, isVirtual: true })
    ];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Any Format'));
    await fireEvent.click(screen.getByRole('button', { name: 'Virtual' }));

    expect(screen.getAllByText('Zoom Group')[0]).toBeInTheDocument();
    expect(screen.queryByText('In-Person Group')).not.toBeInTheDocument();
  });

  test('meetings with both in-person and virtual appear under In-Person filter', async () => {
    dataState.meetings = [
      makeMeeting({ id_bigint: '1', meeting_name: 'In-Person Only', venue_type: 1, isInPerson: true, isVirtual: false }),
      makeMeeting({ id_bigint: '2', meeting_name: 'Both Options', venue_type: 3, isInPerson: true, isVirtual: true })
    ];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Any Format'));
    await fireEvent.click(screen.getByRole('button', { name: 'In-Person' }));

    expect(screen.getAllByText('In-Person Only')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Both Options')[0]).toBeInTheDocument();
  });

  test('meetings with both in-person and virtual appear under Virtual filter', async () => {
    dataState.meetings = [
      makeMeeting({ id_bigint: '1', meeting_name: 'Virtual Only', venue_type: 2, isInPerson: false, isVirtual: true }),
      makeMeeting({ id_bigint: '2', meeting_name: 'Both Options', venue_type: 3, isInPerson: true, isVirtual: true })
    ];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Any Format'));
    await fireEvent.click(screen.getByRole('button', { name: 'Virtual' }));

    expect(screen.getAllByText('Virtual Only')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Both Options')[0]).toBeInTheDocument();
  });

  test('filters meetings by text search', async () => {
    dataState.meetings = [makeMeeting({ id_bigint: '1', meeting_name: 'Serenity Group' }), makeMeeting({ id_bigint: '2', meeting_name: 'Courage to Change' })];
    render(App, { props: { config: baseConfig } });

    const searchInput = screen.getByPlaceholderText('Search meetings...');
    await fireEvent.input(searchInput, { target: { value: 'serenity' } });

    expect(screen.getAllByText('Serenity Group')[0]).toBeInTheDocument();
    expect(screen.queryByText('Courage to Change')).not.toBeInTheDocument();
  });

  test('shows filtered count in footer', async () => {
    dataState.meetings = [makeMeeting({ id_bigint: '1', meeting_name: 'Monday Meeting', weekday_tinyint: 2 }), makeMeeting({ id_bigint: '2', meeting_name: 'Wednesday Meeting', weekday_tinyint: 4 })];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Any Day'));
    await fireEvent.click(screen.getByRole('button', { name: 'Monday' }));

    expect(screen.getByText('Showing 1 meeting')).toBeInTheDocument();
  });
});

describe('format filter', () => {
  test('format dropdown appears when meetings have formats', async () => {
    const fmt = makeFormat({ id: '1', name_string: 'Open' });
    dataState.meetings = [makeMeeting({ resolvedFormats: [fmt], format_shared_id_list: '1' })];
    render(App, { props: { config: baseConfig } });

    // Any Format button is always visible; open it to see the format item
    expect(screen.getByText('Any Format')).toBeInTheDocument();
    await fireEvent.click(screen.getByText('Any Format'));
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  test('format dropdown is hidden when no meetings have formats', async () => {
    dataState.meetings = [makeMeeting({ resolvedFormats: [] })];
    render(App, { props: { config: baseConfig } });

    // Open the type dropdown — format items should not appear
    await fireEvent.click(screen.getByText('Any Format'));
    expect(screen.queryByRole('button', { name: 'Open' })).not.toBeInTheDocument();
  });

  test('selecting a format filters to meetings with that format', async () => {
    const openFmt = makeFormat({ id: '1', name_string: 'Open' });
    const closedFmt = makeFormat({ id: '2', name_string: 'Closed' });
    dataState.meetings = [
      makeMeeting({ id_bigint: '1', meeting_name: 'Open Meeting', resolvedFormats: [openFmt], format_shared_id_list: '1' }),
      makeMeeting({ id_bigint: '2', meeting_name: 'Closed Meeting', resolvedFormats: [closedFmt], format_shared_id_list: '2' })
    ];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Any Format'));
    await fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getAllByText('Open Meeting')[0]).toBeInTheDocument();
    expect(screen.queryByText('Closed Meeting')).not.toBeInTheDocument();
  });

  test('selecting multiple formats shows meetings matching any selected format (OR logic)', async () => {
    const openFmt = makeFormat({ id: '1', name_string: 'Open' });
    const closedFmt = makeFormat({ id: '2', name_string: 'Closed' });
    const candlelightFmt = makeFormat({ id: '3', name_string: 'Candlelight' });
    dataState.meetings = [
      makeMeeting({ id_bigint: '1', meeting_name: 'Open Meeting', resolvedFormats: [openFmt], format_shared_id_list: '1' }),
      makeMeeting({ id_bigint: '2', meeting_name: 'Closed Meeting', resolvedFormats: [closedFmt], format_shared_id_list: '2' }),
      makeMeeting({ id_bigint: '3', meeting_name: 'Candlelight Meeting', resolvedFormats: [candlelightFmt], format_shared_id_list: '3' })
    ];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Any Format'));
    await fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    await fireEvent.click(screen.getByRole('button', { name: 'Closed' }));

    expect(screen.getAllByText('Open Meeting')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Closed Meeting')[0]).toBeInTheDocument();
    expect(screen.queryByText('Candlelight Meeting')).not.toBeInTheDocument();
  });

  test('format filter button shows selected format name', async () => {
    const openFmt = makeFormat({ id: '1', name_string: 'Open' });
    dataState.meetings = [makeMeeting({ resolvedFormats: [openFmt], format_shared_id_list: '1' })];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Any Format'));
    await fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    // Button label updates to show the selected format name
    expect(screen.getAllByText('Open')[0]).toBeInTheDocument();
    expect(screen.queryByText('Any Format')).not.toBeInTheDocument();
  });

  test('active format filter shows clear all filters link', async () => {
    const fmt = makeFormat({ id: '1', name_string: 'Open' });
    dataState.meetings = [makeMeeting({ resolvedFormats: [fmt], format_shared_id_list: '1' })];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Any Format'));
    await fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(screen.getByText('Clear all filters')).toBeInTheDocument();
  });

  test('clear all filters resets format selection', async () => {
    const fmt = makeFormat({ id: '1', name_string: 'Open' });
    dataState.meetings = [makeMeeting({ resolvedFormats: [fmt], format_shared_id_list: '1' })];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Any Format'));
    await fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    await fireEvent.click(screen.getByText('Clear all filters'));

    expect(screen.getByText('Any Format')).toBeInTheDocument();
  });
});

describe('meeting detail', () => {
  async function navigateToDetail(meeting: ProcessedMeeting) {
    dataState.meetings = [meeting];
    render(App, { props: { config: baseConfig } });
    await fireEvent.click(screen.getAllByText(meeting.meeting_name)[0]);
    await waitFor(() => expect(screen.getByText('Back to meetings')).toBeInTheDocument());
  }

  test('clicking a meeting shows detail view', async () => {
    await navigateToDetail(makeMeeting({ meeting_name: 'Monday Night Meeting' }));
    expect(screen.getByText(/7:00 PM/)).toBeInTheDocument();
  });

  test('back button returns to list', async () => {
    dataState.meetings = [makeMeeting({ meeting_name: 'Monday Night Meeting' })];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getAllByText('Monday Night Meeting')[0]);
    await waitFor(() => screen.getByText('Back to meetings'));
    await fireEvent.click(screen.getByText('Back to meetings'));

    await waitFor(() => expect(screen.getAllByText('Monday Night Meeting')[0]).toBeInTheDocument());
  });

  test('shows time range when duration is present', async () => {
    await navigateToDetail(makeMeeting({ start_time: '19:00:00', duration_time: '01:30:00' }));
    expect(screen.getByText(/7:00 PM/)).toBeInTheDocument();
    expect(screen.getByText(/8:30 PM/)).toBeInTheDocument();
  });

  test('falls back to formattedTime when no duration', async () => {
    await navigateToDetail(makeMeeting({ duration_time: '', formattedTime: '7:00 PM' }));
    expect(screen.getByText(/7:00 PM/)).toBeInTheDocument();
  });

  test('shows timezone abbreviation when time_zone is set', async () => {
    await navigateToDetail(makeMeeting({ time_zone: 'America/New_York' }));
    expect(screen.getByText(/E[DS]T/)).toBeInTheDocument();
  });

  test('shows In-Person badge for in-person meetings', async () => {
    await navigateToDetail(makeMeeting({ isInPerson: true, isVirtual: false }));
    expect(screen.getByText('In-Person')).toBeInTheDocument();
  });

  test('shows Virtual badge for virtual meetings', async () => {
    await navigateToDetail(makeMeeting({ venue_type: 2, isInPerson: false, isVirtual: true, latitude: 0, longitude: 0 }));
    expect(screen.getByText('Virtual')).toBeInTheDocument();
  });

  test('shows both badges for hybrid meetings', async () => {
    await navigateToDetail(makeMeeting({ venue_type: 3, isInPerson: true, isVirtual: true }));
    expect(screen.getByText('In-Person')).toBeInTheDocument();
    expect(screen.getByText('Virtual')).toBeInTheDocument();
  });

  test('shows format buttons when formats exist', async () => {
    const fmt = makeFormat({ id: '1', name_string: 'Open', description_string: 'Open to all' });
    await navigateToDetail(makeMeeting({ resolvedFormats: [fmt] }));
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  test('shows address for in-person meetings', async () => {
    await navigateToDetail(makeMeeting({ isInPerson: true, formattedAddress: '123 Main St, Anytown, CA, 90210' }));
    expect(screen.getAllByText('123 Main St, Anytown, CA, 90210').length).toBeGreaterThanOrEqual(1);
  });

  test('shows location_text when present', async () => {
    await navigateToDetail(makeMeeting({ isInPerson: true, location_text: 'Community Center', formattedAddress: '123 Main St' }));
    expect(screen.getByText('Community Center')).toBeInTheDocument();
  });

  test('shows location_info when present', async () => {
    await navigateToDetail(makeMeeting({ isInPerson: true, location_info: 'Room 201', formattedAddress: '123 Main St' }));
    expect(screen.getByText('Room 201')).toBeInTheDocument();
  });

  test('shows virtual meeting join link', async () => {
    await navigateToDetail(
      makeMeeting({
        venue_type: 2,
        isInPerson: false,
        isVirtual: true,
        latitude: 0,
        longitude: 0,
        virtual_meeting_link: 'https://zoom.us/j/123456'
      })
    );
    expect(screen.getByText('Zoom')).toBeInTheDocument();
  });

  test('shows generic join label when provider is unknown', async () => {
    await navigateToDetail(
      makeMeeting({
        venue_type: 2,
        isInPerson: false,
        isVirtual: true,
        latitude: 0,
        longitude: 0,
        virtual_meeting_link: 'https://unknown-platform.example.com/room/42'
      })
    );
    expect(screen.getByText('Join Meeting')).toBeInTheDocument();
  });

  test('shows virtual meeting additional info', async () => {
    await navigateToDetail(
      makeMeeting({
        venue_type: 2,
        isInPerson: false,
        isVirtual: true,
        latitude: 0,
        longitude: 0,
        virtual_meeting_link: 'https://zoom.us/j/123',
        virtual_meeting_additional_info: 'Password: 1234'
      })
    );
    expect(screen.getByText('Password: 1234')).toBeInTheDocument();
  });

  test('shows comments/notes when present', async () => {
    await navigateToDetail(makeMeeting({ comments: 'Bring your own coffee' }));
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Bring your own coffee')).toBeInTheDocument();
  });

  test('shows service body when present', async () => {
    await navigateToDetail(makeMeeting({ service_body_name: 'Greater Metro ASC' }));
    expect(screen.getByText('Service Body')).toBeInTheDocument();
    expect(screen.getByText('Greater Metro ASC')).toBeInTheDocument();
  });

  test('shows email contact when present', async () => {
    await navigateToDetail(makeMeeting({ email_contact: 'info@example.org' }));
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('info@example.org')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'info@example.org' })).toHaveAttribute('href', 'mailto:info@example.org');
  });

  test('hides notes section when comments is empty', async () => {
    await navigateToDetail(makeMeeting({ comments: '' }));
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  test('hides service body section when not present', async () => {
    await navigateToDetail(makeMeeting({ service_body_name: undefined }));
    expect(screen.queryByText('Service Body')).not.toBeInTheDocument();
  });

  test('hides contact section when email not present', async () => {
    await navigateToDetail(makeMeeting({ email_contact: undefined }));
    expect(screen.queryByText('Contact')).not.toBeInTheDocument();
  });

  test('hides address section for virtual-only meetings', async () => {
    await navigateToDetail(makeMeeting({ venue_type: 2, isInPerson: false, isVirtual: true, latitude: 0, longitude: 0 }));
    expect(screen.queryByText('123 Main St, Anytown, CA, 90210')).not.toBeInTheDocument();
  });
});

describe('geolocation', () => {
  const geoConfig: AppConfig = { ...baseConfig, geolocation: true };

  afterEach(() => {
    // Restore geolocation to undefined after each test
    Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true });
  });

  function mockGeo(impl: (success: PositionCallback, error: PositionErrorCallback) => void) {
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: vi.fn(impl) },
      configurable: true
    });
  }

  test('shows error when geolocation API is unavailable', async () => {
    Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true });
    render(App, { props: { config: geoConfig } });
    await waitFor(() => expect(dataState.error).toBe('Unable to get location'));
  });

  test('calls loadDataByCoordinates with position coordinates on success', async () => {
    mockGeo((success) => success({ coords: { latitude: 35.1, longitude: -80.2 } } as GeolocationPosition));
    render(App, { props: { config: geoConfig } });
    await waitFor(() => expect(vi.mocked(loadDataByCoordinates)).toHaveBeenCalledWith(geoConfig.rootServerUrl, 35.1, -80.2, geoConfig.geolocationRadius));
  });

  test('sets geoActive and switches to map view on success', async () => {
    mockGeo((success) => success({ coords: { latitude: 35.1, longitude: -80.2 } } as GeolocationPosition));
    render(App, { props: { config: geoConfig } });
    await waitFor(() => {
      expect(uiState.geoActive).toBe(true);
      expect(uiState.view).toBe('map');
    });
  });

  test('does not set geoActive when loadDataByCoordinates sets an error', async () => {
    mockGeo((success) => success({ coords: { latitude: 35.1, longitude: -80.2 } } as GeolocationPosition));
    vi.mocked(loadDataByCoordinates).mockImplementationOnce(async () => {
      dataState.error = 'Server error';
    });
    render(App, { props: { config: geoConfig } });
    await waitFor(() => expect(vi.mocked(loadDataByCoordinates)).toHaveBeenCalled());
    expect(uiState.geoActive).toBe(false);
  });

  test('shows location denied message on permission error (code 1)', async () => {
    mockGeo((_, error) => error({ code: 1 } as GeolocationPositionError));
    render(App, { props: { config: geoConfig } });
    await waitFor(() => expect(dataState.error).toBe('Location access denied'));
  });

  test('shows location unavailable message on error code 2', async () => {
    mockGeo((_, error) => error({ code: 2 } as GeolocationPositionError));
    render(App, { props: { config: geoConfig } });
    await waitFor(() => expect(dataState.error).toBe('Location unavailable'));
  });

  test('shows timeout message on error code 3', async () => {
    mockGeo((_, error) => error({ code: 3 } as GeolocationPositionError));
    render(App, { props: { config: geoConfig } });
    await waitFor(() => expect(dataState.error).toBe('Location request timed out'));
  });

  test('sets loading false after geolocation error', async () => {
    mockGeo((_, error) => error({ code: 1 } as GeolocationPositionError));
    render(App, { props: { config: geoConfig } });
    await waitFor(() => expect(dataState.loading).toBe(false));
  });
});
