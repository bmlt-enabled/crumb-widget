import { test, expect, type Page } from '@playwright/test';

const MEETINGS = [
  {
    id_bigint: '1',
    weekday_tinyint: '2',
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
  }
];

const FORMATS = [{ id: '1', key_string: 'O', name_string: 'Open', description_string: 'Open to all', lang: 'en' }];

async function mockBmltApi(page: Page) {
  await page.route('https://bmlt.e2e.test/**', (route) => route.fulfill({ json: { meetings: MEETINGS, formats: FORMATS } }));
}

// ?view=list bypasses the auto-geolocation that fires at mount when geolocation
// is enabled, so the manual "click Near Me" flow can be exercised explicitly.
async function loadWidget(page: Page) {
  await mockBmltApi(page);
  await page.goto('/src/tests/e2e/fixture-geo.html?view=list');
  // Meeting count footer is layout-agnostic (desktop table + mobile cards both render it).
  await expect(page.getByText(/Showing\s+\d+\s+meeting/)).toBeVisible({ timeout: 15000 });
}

test.describe('Geolocation — Near Me', () => {
  test('granted permission opens dropdown and applies radius', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 34.05, longitude: -118.24 });

    await loadWidget(page);

    await page.getByText('Anywhere', { exact: true }).click();
    await page.getByRole('button', { name: /^25\s+mi$/ }).click();

    await expect(page.getByText(/Near Me\s*·\s*25\s*mi/)).toBeVisible();
  });

  test('denied permission surfaces an error on the button', async ({ page, context }) => {
    await context.clearPermissions();

    await loadWidget(page);

    await page.getByText('Anywhere', { exact: true }).click();
    await page.getByRole('button', { name: /^25\s+mi$/ }).click();

    // On error, the button renders one of locationDenied / locationUnavailable / locationError
    // ("Location access denied", "Location unavailable", "Location request timed out", "Unable to get location").
    await expect(page.getByText(/Location|Unable to get/i).first()).toBeVisible({ timeout: 5000 });
  });
});
