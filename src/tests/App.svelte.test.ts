import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import App from '@/App.svelte';
import type { AppConfig } from '@/types/index';
import { dataState } from '@stores/data.svelte';
import { uiState, resetFilters } from '@stores/ui.svelte';
import type { ProcessedMeeting } from '@/types/index';

// Prevent real API calls in all tests
vi.mock('@stores/data.svelte', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@stores/data.svelte')>();
  return {
    ...actual,
    loadData: vi.fn()
  };
});

const baseConfig: AppConfig = {
  rootServerUrl: 'https://test.example.org/main_server',
  serviceBodyIds: [],
  defaultView: 'list',
  containerId: 'bmlt-meeting-list'
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
    dayName: 'Monday',
    dayShort: 'Mon',
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
  uiState.selectedMeetingId = null;
});

describe('App', () => {
  test('renders header', () => {
    render(App, { props: { config: baseConfig } });
    expect(screen.getByText('NA Meeting Finder')).toBeInTheDocument();
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
    expect(screen.getByText('Monday Night Meeting')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('7:00 PM')).toBeInTheDocument();
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

    // Open filters, then click the Mon filter chip (button role to avoid the dayShort cell)
    await fireEvent.click(screen.getByText('Filters'));
    const monButtons = screen.getAllByRole('button', { name: 'Mon' });
    await fireEvent.click(monButtons[0]);

    expect(screen.getByText('Monday Meeting')).toBeInTheDocument();
    expect(screen.queryByText('Wednesday Meeting')).not.toBeInTheDocument();
  });

  test('filters meetings by venue type', async () => {
    dataState.meetings = [
      makeMeeting({ id_bigint: '1', meeting_name: 'In-Person Group', venue_type: 1, isInPerson: true, isVirtual: false }),
      makeMeeting({ id_bigint: '2', meeting_name: 'Zoom Group', venue_type: 2, isInPerson: false, isVirtual: true })
    ];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Filters'));
    await fireEvent.click(screen.getByRole('button', { name: 'Virtual' }));

    expect(screen.getByText('Zoom Group')).toBeInTheDocument();
    expect(screen.queryByText('In-Person Group')).not.toBeInTheDocument();
  });

  test('meetings with both in-person and virtual appear under In-Person filter', async () => {
    dataState.meetings = [
      makeMeeting({ id_bigint: '1', meeting_name: 'In-Person Only', venue_type: 1, isInPerson: true, isVirtual: false }),
      makeMeeting({ id_bigint: '2', meeting_name: 'Both Options', venue_type: 3, isInPerson: true, isVirtual: true })
    ];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Filters'));
    await fireEvent.click(screen.getByRole('button', { name: 'In-Person' }));

    expect(screen.getByText('In-Person Only')).toBeInTheDocument();
    expect(screen.getByText('Both Options')).toBeInTheDocument();
  });

  test('meetings with both in-person and virtual appear under Virtual filter', async () => {
    dataState.meetings = [
      makeMeeting({ id_bigint: '1', meeting_name: 'Virtual Only', venue_type: 2, isInPerson: false, isVirtual: true }),
      makeMeeting({ id_bigint: '2', meeting_name: 'Both Options', venue_type: 3, isInPerson: true, isVirtual: true })
    ];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Filters'));
    await fireEvent.click(screen.getByRole('button', { name: 'Virtual' }));

    expect(screen.getByText('Virtual Only')).toBeInTheDocument();
    expect(screen.getByText('Both Options')).toBeInTheDocument();
  });

  test('filters meetings by text search', async () => {
    dataState.meetings = [makeMeeting({ id_bigint: '1', meeting_name: 'Serenity Group' }), makeMeeting({ id_bigint: '2', meeting_name: 'Courage to Change' })];
    render(App, { props: { config: baseConfig } });

    const searchInput = screen.getByPlaceholderText('Search meetings...');
    await fireEvent.input(searchInput, { target: { value: 'serenity' } });

    expect(screen.getByText('Serenity Group')).toBeInTheDocument();
    expect(screen.queryByText('Courage to Change')).not.toBeInTheDocument();
  });

  test('shows filtered count in footer', async () => {
    dataState.meetings = [makeMeeting({ id_bigint: '1', meeting_name: 'Monday Meeting', weekday_tinyint: 2 }), makeMeeting({ id_bigint: '2', meeting_name: 'Wednesday Meeting', weekday_tinyint: 4 })];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Filters'));
    const monButtons = screen.getAllByRole('button', { name: 'Mon' });
    await fireEvent.click(monButtons[0]);

    expect(screen.getByText('Showing 1 meeting')).toBeInTheDocument();
  });
});

describe('meeting detail', () => {
  test('clicking a meeting shows detail view', async () => {
    dataState.meetings = [makeMeeting({ meeting_name: 'Monday Night Meeting' })];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Monday Night Meeting'));

    expect(screen.getByText('Back to meetings')).toBeInTheDocument();
    // Time is embedded in "Monday at 7:00 PM" so match with regex
    expect(screen.getByText(/7:00 PM/)).toBeInTheDocument();
  });

  test('back button returns to list', async () => {
    dataState.meetings = [makeMeeting({ meeting_name: 'Monday Night Meeting' })];
    render(App, { props: { config: baseConfig } });

    await fireEvent.click(screen.getByText('Monday Night Meeting'));
    await fireEvent.click(screen.getByText('Back to meetings'));

    expect(screen.getByText('Monday Night Meeting')).toBeInTheDocument();
  });
});
