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
  },
  {
    id_bigint: '2',
    weekday_tinyint: '4',
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
  }
];

const FORMATS = [{ id: '1', key_string: 'O', name_string: 'Open', description_string: 'Open to all', lang: 'en' }];

async function loadWidget(page: Page) {
  await page.route('https://bmlt.e2e.test/**', (route) => route.fulfill({ json: { meetings: MEETINGS, formats: FORMATS } }));
  await page.goto('/src/tests/e2e/fixture.html');
  // Meeting count footer is layout-agnostic (desktop table + mobile cards both render it).
  await expect(page.getByText(/Showing\s+\d+\s+meeting/)).toBeVisible({ timeout: 15000 });
}

test.describe('Map view', () => {
  test('toggling to Map renders the Leaflet container', async ({ page }) => {
    await loadWidget(page);
    await page.getByRole('button', { name: 'Map', exact: true }).click();
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });

  test('markers render for in-person meetings', async ({ page }) => {
    await loadWidget(page);
    await page.getByRole('button', { name: 'Map', exact: true }).click();
    await expect(page.locator('.leaflet-container')).toBeVisible();
    // Leaflet renders one marker per unique lat,lng pair; two in-person meetings → two markers.
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(2);
  });

  test('clicking a marker opens a popup with the meeting name', async ({ page }) => {
    await loadWidget(page);
    await page.getByRole('button', { name: 'Map', exact: true }).click();
    await expect(page.locator('.leaflet-container')).toBeVisible();

    await page.locator('.leaflet-marker-icon').first().click();
    await expect(page.locator('.leaflet-popup-content')).toBeVisible();
    await expect(page.locator('.leaflet-popup-content')).toContainText(/Monday Serenity Group|Wednesday Morning Group/);
  });

  test('returning to List view hides the map', async ({ page }) => {
    await loadWidget(page);
    await page.getByRole('button', { name: 'Map', exact: true }).click();
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await page.getByRole('button', { name: 'List', exact: true }).click();
    await expect(page.locator('.leaflet-container')).not.toBeVisible();
    await expect(page.getByText(/Showing\s+\d+\s+meeting/)).toBeVisible();
  });
});
