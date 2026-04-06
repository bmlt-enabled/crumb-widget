import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import MeetingDetail from '@components/MeetingDetail.svelte';
import type { ProcessedMeeting, Format } from '@/types/index';
import { config } from '@stores/config.svelte';

// Mock leaflet — MeetingDetail uses L.map, L.marker, etc. in onMount
vi.mock('leaflet', () => {
  const mockMarker = {
    bindPopup: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    openPopup: vi.fn().mockReturnThis(),
    getElement: vi.fn(() => {
      const el = document.createElement('div');
      el.appendChild(document.createElement('img'));
      return el;
    })
  };
  const mockMap = {
    setView: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    invalidateSize: vi.fn(),
    on: vi.fn().mockReturnThis()
  };
  return {
    default: {
      map: vi.fn(() => mockMap),
      marker: vi.fn(() => mockMarker),
      tileLayer: vi.fn(() => ({ addTo: vi.fn().mockReturnThis(), remove: vi.fn() })),
      divIcon: vi.fn(() => ({})),
      DivIcon: vi.fn(),
      Point: vi.fn(function (this: any, x: number, y: number) {
        this.x = x;
        this.y = y;
      })
    }
  };
});

vi.mock('@utils/mapUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@utils/mapUtils')>();
  return {
    ...actual,
    observeMapResize: vi.fn(() => vi.fn())
  };
});

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
  config.containerId = 'crumb-widget';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MeetingDetail — header', () => {
  test('renders meeting name', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting() } });
    expect(screen.getByText('Monday Night Meeting')).toBeInTheDocument();
  });

  test('renders back to meetings link', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting() } });
    expect(screen.getByText('Back to meetings')).toBeInTheDocument();
    expect(screen.getByText('Back to meetings').closest('a')).toHaveAttribute('href', '#/');
  });
});

describe('MeetingDetail — schedule', () => {
  test('shows time range when duration is present', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ start_time: '19:00:00', duration_time: '01:30:00' }) } });
    expect(screen.getByText(/7:00 PM/)).toBeInTheDocument();
    expect(screen.getByText(/8:30 PM/)).toBeInTheDocument();
  });

  test('falls back to formattedTime when no duration', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ duration_time: '', formattedTime: '7:00 PM' }) } });
    expect(screen.getByText(/7:00 PM/)).toBeInTheDocument();
  });

  test('shows timezone abbreviation when time_zone is set', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ time_zone: 'America/New_York' }) } });
    expect(screen.getByText(/E[DS]T/)).toBeInTheDocument();
  });
});

describe('MeetingDetail — venue badges', () => {
  test('shows In-Person badge', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ isInPerson: true, isVirtual: false }) } });
    expect(screen.getByText('In-Person')).toBeInTheDocument();
  });

  test('shows Virtual badge', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ venue_type: 2, isInPerson: false, isVirtual: true, latitude: 0, longitude: 0 }) } });
    expect(screen.getByText('Virtual')).toBeInTheDocument();
  });

  test('shows both badges for hybrid meetings', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ venue_type: 3, isInPerson: true, isVirtual: true }) } });
    expect(screen.getByText('In-Person')).toBeInTheDocument();
    expect(screen.getByText('Virtual')).toBeInTheDocument();
  });
});

describe('MeetingDetail — formats', () => {
  test('shows format buttons when formats exist', () => {
    const fmt = makeFormat({ name_string: 'Open' });
    render(MeetingDetail, { props: { meeting: makeMeeting({ resolvedFormats: [fmt] }) } });
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  test('format button has description as title attribute', () => {
    const fmt = makeFormat({ name_string: 'Open', description_string: 'Open to all' });
    render(MeetingDetail, { props: { meeting: makeMeeting({ resolvedFormats: [fmt] }) } });
    expect(screen.getByText('Open')).toHaveAttribute('title', 'Open to all');
  });
});

describe('MeetingDetail — address', () => {
  test('shows address for in-person meetings', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ isInPerson: true }) } });
    expect(screen.getAllByText('123 Main St, Anytown, CA, 90210').length).toBeGreaterThanOrEqual(1);
  });

  test('shows location_text when present', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ location_text: 'Community Center' }) } });
    expect(screen.getAllByText('Community Center').length).toBeGreaterThan(0);
  });

  test('shows location_info when present', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ location_info: 'Room 201' }) } });
    expect(screen.getByText('Room 201')).toBeInTheDocument();
  });

  test('hides address for virtual-only meetings', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ venue_type: 2, isInPerson: false, isVirtual: true, latitude: 0, longitude: 0 }) } });
    expect(screen.queryByText('123 Main St, Anytown, CA, 90210')).not.toBeInTheDocument();
  });
});

describe('MeetingDetail — directions', () => {
  test('shows directions button for in-person meetings with address', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ isInPerson: true, formattedAddress: '123 Main St' }) } });
    expect(screen.getByText('Get Directions')).toBeInTheDocument();
  });

  test('hides directions button for virtual meetings', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ isInPerson: false, isVirtual: true, venue_type: 2, latitude: 0, longitude: 0 }) } });
    expect(screen.queryByText('Get Directions')).not.toBeInTheDocument();
  });
});

describe('MeetingDetail — virtual meeting', () => {
  test('shows join link with provider name', () => {
    render(MeetingDetail, {
      props: { meeting: makeMeeting({ venue_type: 2, isInPerson: false, isVirtual: true, latitude: 0, longitude: 0, virtual_meeting_link: 'https://zoom.us/j/123456' }) }
    });
    expect(screen.getByText('Zoom')).toBeInTheDocument();
  });

  test('shows generic join label for unknown provider', () => {
    render(MeetingDetail, {
      props: {
        meeting: makeMeeting({ venue_type: 2, isInPerson: false, isVirtual: true, latitude: 0, longitude: 0, virtual_meeting_link: 'https://unknown-platform.example.com/room/42' })
      }
    });
    expect(screen.getByText('Join Meeting')).toBeInTheDocument();
  });

  test('shows virtual meeting additional info', () => {
    render(MeetingDetail, {
      props: {
        meeting: makeMeeting({
          venue_type: 2,
          isInPerson: false,
          isVirtual: true,
          latitude: 0,
          longitude: 0,
          virtual_meeting_link: 'https://zoom.us/j/123',
          virtual_meeting_additional_info: 'Password: 1234'
        })
      }
    });
    expect(screen.getByText('Password: 1234')).toBeInTheDocument();
  });
});

describe('MeetingDetail — optional sections', () => {
  test('shows notes when comments present', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ comments: 'Bring your own coffee' }) } });
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Bring your own coffee')).toBeInTheDocument();
  });

  test('hides notes when comments empty', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ comments: '' }) } });
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
  });

  test('shows service body when present', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ service_body_name: 'Greater Metro ASC' }) } });
    expect(screen.getByText('Service Body')).toBeInTheDocument();
    expect(screen.getByText('Greater Metro ASC')).toBeInTheDocument();
  });

  test('hides service body when not present', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ service_body_name: undefined }) } });
    expect(screen.queryByText('Service Body')).not.toBeInTheDocument();
  });

  test('shows email contact', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ email_contact: 'info@example.org' }) } });
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'info@example.org' })).toHaveAttribute('href', 'mailto:info@example.org');
  });

  test('hides contact when no email', () => {
    render(MeetingDetail, { props: { meeting: makeMeeting({ email_contact: undefined }) } });
    expect(screen.queryByText('Contact')).not.toBeInTheDocument();
  });
});

describe('MeetingDetail — sibling meetings', () => {
  test('shows "Also at this location" for meetings at same address', () => {
    const primary = makeMeeting({ id_bigint: '1', meeting_name: 'Monday Night Meeting', location_street: '123 Main St', location_municipality: 'Anytown' });
    const sibling = makeMeeting({
      id_bigint: '2',
      meeting_name: 'Thursday Noon Group',
      weekday_tinyint: 5,
      formattedTime: '12:00 PM',
      location_street: '123 Main St',
      location_municipality: 'Anytown'
    });
    render(MeetingDetail, { props: { meeting: primary, allMeetings: [primary, sibling] } });
    expect(screen.getByText('Also at this location')).toBeInTheDocument();
    expect(screen.getByText('Thursday Noon Group')).toBeInTheDocument();
  });

  test('does not show section when no siblings', () => {
    const primary = makeMeeting({ id_bigint: '1', location_street: '123 Main St', location_municipality: 'Anytown' });
    const other = makeMeeting({ id_bigint: '2', location_street: '456 Oak Ave', location_municipality: 'Anytown' });
    render(MeetingDetail, { props: { meeting: primary, allMeetings: [primary, other] } });
    expect(screen.queryByText('Also at this location')).not.toBeInTheDocument();
  });

  test('does not include current meeting in siblings', () => {
    const primary = makeMeeting({ id_bigint: '1', meeting_name: 'Monday Night Meeting', location_street: '123 Main St', location_municipality: 'Anytown' });
    render(MeetingDetail, { props: { meeting: primary, allMeetings: [primary] } });
    expect(screen.queryByText('Also at this location')).not.toBeInTheDocument();
  });
});
