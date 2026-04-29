import { test, expect, type Page } from '@playwright/test';

// Minimal BMLT API fixture data
const MEETINGS = [
  {
    id_bigint: '1',
    weekday_tinyint: '2', // Monday
    start_time: '19:00:00',
    duration_time: '01:00:00',
    venue_type: '1',
    meeting_name: 'Monday Serenity Group',
    location_text: 'Community Center',
    location_street: '123 Main St',
    location_municipality: 'Anytown',
    location_province: 'CA',
    location_postal_code_1: '90210',
    latitude: '34.05',
    longitude: '-118.24',
    published: '1',
    service_body_bigint: '1',
    service_body_name: 'Metro Area',
    format_shared_id_list: '1',
    comments: '',
    email_contact: ''
  },
  {
    id_bigint: '2',
    weekday_tinyint: '4', // Wednesday
    start_time: '09:00:00',
    duration_time: '01:00:00',
    venue_type: '1',
    meeting_name: 'Wednesday Morning Group',
    location_text: 'Church Hall',
    location_street: '456 Oak Ave',
    location_municipality: 'Springfield',
    location_province: 'IL',
    location_postal_code_1: '62701',
    latitude: '39.78',
    longitude: '-89.65',
    published: '1',
    service_body_bigint: '1',
    service_body_name: 'Metro Area',
    format_shared_id_list: '',
    comments: '',
    email_contact: ''
  },
  {
    id_bigint: '3',
    weekday_tinyint: '6', // Friday
    start_time: '20:00:00',
    duration_time: '01:30:00',
    venue_type: '2', // virtual
    meeting_name: 'Friday Online Group',
    location_text: '',
    location_street: '',
    location_municipality: '',
    location_province: '',
    location_postal_code_1: '',
    latitude: '0',
    longitude: '0',
    published: '1',
    service_body_bigint: '1',
    service_body_name: 'Metro Area',
    format_shared_id_list: '',
    virtual_meeting_link: 'https://zoom.us/j/999',
    comments: '',
    email_contact: ''
  }
];

const FORMATS = [{ id: '1', key_string: 'O', name_string: 'Open', description_string: 'Open to all', lang: 'en' }];

async function mockBmltApi(page: Page) {
  // The client calls GetSearchResults with get_used_formats=1 in a single request,
  // and expects { meetings: [...], formats: [...] } back.
  await page.route('https://bmlt.e2e.test/**', (route) => {
    return route.fulfill({ json: { meetings: MEETINGS, formats: FORMATS } });
  });
}

// Helper: whichever rendering of the meeting name is currently visible.
// Desktop renders a <table> with role="cell"; mobile renders stacked <button>
// cards. The opposite layout is CSS-hidden, so filter to :visible.
function meetingCell(page: Page, name: string) {
  return page.locator(`:text-is("${name}")`).locator('visible=true').first();
}

async function loadWidget(page: Page) {
  await mockBmltApi(page);
  await page.goto('/src/tests/e2e/fixture.html');
  // Meeting count footer is layout-agnostic.
  await expect(page.getByText(/Showing\s+\d+\s+meeting/)).toBeVisible({ timeout: 15000 });
}

test.describe('Widget — meeting list', () => {
  test('renders meetings from the API', async ({ page }) => {
    await loadWidget(page);
    await expect(meetingCell(page, 'Monday Serenity Group')).toBeVisible();
    await expect(meetingCell(page, 'Wednesday Morning Group')).toBeVisible();
    await expect(meetingCell(page, 'Friday Online Group')).toBeVisible();
  });

  test('shows meeting count in footer', async ({ page }) => {
    await loadWidget(page);
    await expect(page.getByText(/Showing\s+3\s+meetings/)).toBeVisible();
  });

  test('search filters meetings by name', async ({ page }) => {
    await loadWidget(page);
    await page.getByPlaceholder('Search meetings...').fill('serenity');
    await expect(meetingCell(page, 'Monday Serenity Group')).toBeVisible();
    await expect(meetingCell(page, 'Wednesday Morning Group')).not.toBeVisible();
    await expect(meetingCell(page, 'Friday Online Group')).not.toBeVisible();
    await expect(page.getByText(/Showing\s+1\s+meeting/)).toBeVisible();
  });

  test('day filter shows only meetings on selected day', async ({ page }) => {
    await loadWidget(page);
    await page.getByText('Any Day').click();
    await page.getByRole('button', { name: 'Wednesday', exact: true }).click();
    await expect(meetingCell(page, 'Wednesday Morning Group')).toBeVisible();
    await expect(meetingCell(page, 'Monday Serenity Group')).not.toBeVisible();
  });

  test('virtual venue filter shows only online meetings', async ({ page }) => {
    await loadWidget(page);
    await page.getByText('Any Format').click();
    await page.getByRole('button', { name: 'Virtual' }).click();
    await expect(meetingCell(page, 'Friday Online Group')).toBeVisible();
    await expect(meetingCell(page, 'Monday Serenity Group')).not.toBeVisible();
  });
});

test.describe('Widget — meeting detail', () => {
  test('clicking a meeting opens the detail view', async ({ page }) => {
    await loadWidget(page);
    await meetingCell(page, 'Monday Serenity Group').click();
    await expect(page.getByText('Back to meetings')).toBeVisible();
    await expect(page.getByText('7:00 PM')).toBeVisible();
  });

  test('back button returns to the meeting list', async ({ page }) => {
    await loadWidget(page);
    await meetingCell(page, 'Monday Serenity Group').click();
    await expect(page.getByText('Back to meetings')).toBeVisible();
    await page.getByText('Back to meetings').click();
    await expect(meetingCell(page, 'Monday Serenity Group')).toBeVisible();
  });

  test('virtual meeting shows online badge', async ({ page }) => {
    await loadWidget(page);
    await meetingCell(page, 'Friday Online Group').click();
    await expect(page.getByText('Back to meetings')).toBeVisible();
    await expect(page.getByText('Virtual')).toBeVisible();
  });
});

test.describe('Widget — in-progress banner', () => {
  // Banner is rendered in both layouts; one is CSS-hidden. Pick whichever is visible.
  const visibleBanner = (page: Page) => page.locator('.bmlt-in-progress-banner').locator('visible=true').first();

  async function loadWidgetInProgress(page: Page) {
    await mockBmltApi(page);
    await page.goto('/src/tests/e2e/fixture.html');
    await expect(visibleBanner(page)).toBeVisible({ timeout: 15000 });
  }

  test('shows in-progress banner for meetings that just started', async ({ page }) => {
    // Mon Jan 8 2024 at 7:05pm — the 7:00pm Monday meeting is 5min in (within 10min offset)
    await page.clock.setFixedTime(new Date('2024-01-08T19:05:00'));
    await loadWidgetInProgress(page);
    await expect(visibleBanner(page)).toContainText(/1\s+meeting\s+in progress/i);
  });

  test('clicking the banner reveals the in-progress meeting', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2024-01-08T19:05:00'));
    await loadWidgetInProgress(page);
    // Meeting is hidden behind the collapsed banner
    await expect(meetingCell(page, 'Monday Serenity Group')).not.toBeVisible();
    // Expand the banner
    await visibleBanner(page).click();
    await expect(meetingCell(page, 'Monday Serenity Group')).toBeVisible();
  });

  // Regression: the alternating-row selector `.bmlt-row:nth-child(even of .bmlt-row)`
  // has specificity (1,3,0) because :nth-child(of S) adds the inner selector list.
  // The in-progress rule must match that or higher, otherwise every 2nd in-progress
  // row loses its highlight to the alt-row gray.
  test('every in-progress row gets the highlight background', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2024-01-08T19:05:00'));
    await page.route('https://bmlt.e2e.test/**', (route) => {
      const twoInProgress = [
        { ...MEETINGS[0]!, id_bigint: '101', meeting_name: 'Live Group A', start_time: '19:00:00' },
        { ...MEETINGS[0]!, id_bigint: '102', meeting_name: 'Live Group B', start_time: '19:00:00' },
        // A non-in-progress meeting so the alt-row CSS is in play below the banner
        { ...MEETINGS[0]!, id_bigint: '103', meeting_name: 'Later Group', start_time: '21:00:00' }
      ];
      return route.fulfill({ json: { meetings: twoInProgress, formats: FORMATS } });
    });
    await page.goto('/src/tests/e2e/fixture.html');
    await expect(visibleBanner(page)).toContainText(/2\s+meetings\s+in progress/i);
    await visibleBanner(page).click();

    const rows = page.locator('.bmlt-in-progress-row').locator('visible=true');
    await expect(rows).toHaveCount(2);

    const bg = (i: number) => rows.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor);
    const [bg0, bg1] = await Promise.all([bg(0), bg(1)]);
    expect(bg0).toBe(bg1);

    // And it must actually match the in-progress token, not the alt-row gray.
    const expected = await page.evaluate(() => {
      const root = document.getElementById('crumb-widget')!;
      return getComputedStyle(root).getPropertyValue('--bmlt-in-progress-bg').trim();
    });
    expect(expected).not.toBe('');
    const normalized = await page.evaluate((color) => {
      const probe = document.createElement('div');
      probe.style.color = color;
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    }, expected);
    expect(bg0).toBe(normalized);
  });
});
