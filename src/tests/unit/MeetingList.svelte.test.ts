import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import MeetingList from '@components/MeetingList.svelte';
import type { ProcessedMeeting } from '@/types/index';
import { config } from '@stores/config.svelte';

vi.mock('@bmlt-enabled/svelte-spa-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@bmlt-enabled/svelte-spa-router')>();
  return {
    ...actual,
    push: vi.fn((path: string) => {
      window.location.hash = path.startsWith('#') ? path : '#' + path;
    })
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
  vi.useFakeTimers();
  config.columns = ['time', 'name', 'location', 'address'];
  config.nowOffset = 10;
});

afterEach(() => {
  vi.useRealTimers();
});

describe('MeetingList — empty state', () => {
  test('shows no meetings message when list is empty', () => {
    render(MeetingList, { props: { meetings: [] } });
    expect(screen.getByText('No meetings found')).toBeInTheDocument();
  });
});

describe('MeetingList — regular meetings', () => {
  test('renders meeting name and day', () => {
    const meeting = makeMeeting({ meeting_name: 'Friday Night Group', weekday_tinyint: 6, formattedTime: '8:00 PM' });
    render(MeetingList, { props: { meetings: [meeting] } });
    expect(screen.getAllByText('Friday Night Group')[0]).toBeInTheDocument();
  });

  test('shows meeting count in footer', () => {
    const meetings = [makeMeeting({ id_bigint: '1' }), makeMeeting({ id_bigint: '2' })];
    render(MeetingList, { props: { meetings } });
    expect(screen.getByText(/Showing\s+2\s+meetings/)).toBeInTheDocument();
  });

  test('shows singular "meeting" for one result', () => {
    render(MeetingList, { props: { meetings: [makeMeeting()] } });
    expect(screen.getByText(/Showing\s+1\s+meeting/)).toBeInTheDocument();
  });

  test('renders in-person address badge', () => {
    render(MeetingList, { props: { meetings: [makeMeeting({ isInPerson: true })] } });
    expect(screen.getAllByText(/123 Main St/)[0]).toBeInTheDocument();
  });

  test('renders virtual badge', () => {
    const meeting = makeMeeting({ isVirtual: true, isInPerson: false, venue_type: 2 });
    render(MeetingList, { props: { meetings: [meeting] } });
    expect(screen.getAllByText('Online meeting')[0]).toBeInTheDocument();
  });

  test('hides location column when not in config', () => {
    config.columns = ['time', 'name', 'address'];
    const meeting = makeMeeting({ location_text: 'Secret Spot' });
    render(MeetingList, { props: { meetings: [meeting] } });
    expect(screen.queryByText('Secret Spot')).not.toBeInTheDocument();
  });

  test('shows service_body column when configured', () => {
    config.columns = ['time', 'name', 'location', 'address', 'service_body'];
    const meeting = makeMeeting({ service_body_name: 'Capital Area' } as Partial<ProcessedMeeting>);
    render(MeetingList, { props: { meetings: [meeting] } });
    expect(screen.getAllByText('Capital Area')[0]).toBeInTheDocument();
  });
});

describe('MeetingList — in-progress banner', () => {
  test('shows banner when a meeting is in progress', () => {
    // Today is Mon (getDay=1, bmlt=2) at 7:05pm — meeting at 7:00pm is 5min in, within 10min offset
    vi.setSystemTime(new Date(2024, 0, 8, 19, 5)); // Mon
    const meeting = makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00' });
    render(MeetingList, { props: { meetings: [meeting] } });
    // Banner renders in both mobile and desktop layouts
    expect(screen.getAllByText(/in progress/i).length).toBeGreaterThan(0);
  });

  test('does not show banner when no meetings are in progress', () => {
    vi.setSystemTime(new Date(2024, 0, 8, 10, 0)); // Mon 10am, meeting at 7pm is future
    const meeting = makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00' });
    render(MeetingList, { props: { meetings: [meeting] } });
    expect(screen.queryAllByText(/in progress/i)).toHaveLength(0);
  });

  test('banner is collapsed by default — in-progress meeting not visible', () => {
    vi.setSystemTime(new Date(2024, 0, 8, 19, 5));
    const meeting = makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00', meeting_name: 'Hidden Group' });
    render(MeetingList, { props: { meetings: [meeting] } });
    expect(screen.queryAllByText('Hidden Group')).toHaveLength(0);
  });

  test('clicking banner expands in-progress meetings', async () => {
    vi.setSystemTime(new Date(2024, 0, 8, 19, 5));
    const meeting = makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00', meeting_name: 'Hidden Group' });
    render(MeetingList, { props: { meetings: [meeting] } });

    // Click the first banner (mobile)
    const banners = screen.getAllByText(/in progress/i).map((el) => el.closest('button')!);
    await fireEvent.click(banners[0]!);

    expect(screen.getAllByText('Hidden Group')[0]).toBeInTheDocument();
  });

  test('clicking banner again collapses in-progress meetings', async () => {
    vi.setSystemTime(new Date(2024, 0, 8, 19, 5));
    const meeting = makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00', meeting_name: 'Hidden Group' });
    render(MeetingList, { props: { meetings: [meeting] } });

    const banners = screen.getAllByText(/in progress/i).map((el) => el.closest('button')!);
    await fireEvent.click(banners[0]!);
    expect(screen.getAllByText('Hidden Group')[0]).toBeInTheDocument();

    await fireEvent.click(banners[0]!);
    expect(screen.queryAllByText('Hidden Group')).toHaveLength(0);
  });

  test('banner shows correct count for multiple in-progress meetings', () => {
    vi.setSystemTime(new Date(2024, 0, 8, 19, 5));
    const m1 = makeMeeting({ id_bigint: '1', weekday_tinyint: 2, start_time: '19:00:00' });
    const m2 = makeMeeting({ id_bigint: '2', weekday_tinyint: 2, start_time: '18:58:00' });
    render(MeetingList, { props: { meetings: [m1, m2] } });
    expect(screen.getAllByText(/2\s+meetings\s+in progress/i).length).toBeGreaterThan(0);
  });

  test('banner shows singular "meeting" for one in-progress', () => {
    vi.setSystemTime(new Date(2024, 0, 8, 19, 5));
    const meeting = makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00' });
    render(MeetingList, { props: { meetings: [meeting] } });
    expect(screen.getAllByText(/1\s+meeting\s+in progress/i).length).toBeGreaterThan(0);
  });

  test('non-in-progress meetings still render below the banner', () => {
    vi.setSystemTime(new Date(2024, 0, 8, 19, 5));
    const inProg = makeMeeting({ id_bigint: '1', weekday_tinyint: 2, start_time: '19:00:00', meeting_name: 'In Progress Group' });
    const upcoming = makeMeeting({ id_bigint: '2', weekday_tinyint: 2, start_time: '20:00:00', meeting_name: 'Upcoming Group' });
    render(MeetingList, { props: { meetings: [inProg, upcoming] } });
    // Upcoming always visible
    expect(screen.getAllByText('Upcoming Group')[0]).toBeInTheDocument();
    // In-progress hidden until expanded
    expect(screen.queryAllByText('In Progress Group')).toHaveLength(0);
  });

  test('respects nowOffset=0 — meeting just started is not in progress', () => {
    config.nowOffset = 0;
    vi.setSystemTime(new Date(2024, 0, 8, 19, 5));
    // With offset=0, 19:00 started 5min ago and is past the cutoff
    const meeting = makeMeeting({ weekday_tinyint: 2, start_time: '19:00:00' });
    render(MeetingList, { props: { meetings: [meeting] } });
    expect(screen.queryByText(/in progress/i)).not.toBeInTheDocument();
  });
});
