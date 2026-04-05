import { test, expect, type Page } from '@playwright/test';
import { checkA11y, injectAxe } from 'axe-playwright';

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
    id_bigint: '3',
    weekday_tinyint: '6',
    start_time: '20:00:00',
    duration_time: '01:30:00',
    venue_type: '2',
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

const FORMATS = [
  { id: '1', key_string: 'O', name_string: 'Open', description_string: 'Open to all', lang: 'en' }
];

async function loadWidget(page: Page) {
  await page.route('https://bmlt.e2e.test/**', (route) =>
    route.fulfill({ json: { meetings: MEETINGS, formats: FORMATS } })
  );
  await page.goto('/e2e/fixture.html');
  await expect(page.getByRole('cell', { name: 'Monday Serenity Group', exact: true })).toBeVisible({
    timeout: 15000
  });
  await injectAxe(page);
}

test.describe('Accessibility', () => {
  test('meeting list has no violations', async ({ page }) => {
    await loadWidget(page);
    await checkA11y(page, '#crumb-widget');
  });

  test('meeting detail has no violations', async ({ page }) => {
    await loadWidget(page);
    await page.getByRole('cell', { name: 'Monday Serenity Group', exact: true }).click();
    await expect(page.getByText('Back to meetings')).toBeVisible();
    await checkA11y(page, '#crumb-widget');
  });

  test('virtual meeting detail has no violations', async ({ page }) => {
    await loadWidget(page);
    await page.getByRole('cell', { name: 'Friday Online Group', exact: true }).click();
    await expect(page.getByText('Back to meetings')).toBeVisible();
    await checkA11y(page, '#crumb-widget');
  });

  test('in-progress banner has no violations', async ({ page }) => {
    // Mon Jan 8 2024 at 7:05pm — Monday meeting is in progress
    await page.clock.setFixedTime(new Date('2024-01-08T19:05:00'));
    await page.route('https://bmlt.e2e.test/**', (route) =>
      route.fulfill({ json: { meetings: MEETINGS, formats: FORMATS } })
    );
    await page.goto('/e2e/fixture.html');
    await expect(page.locator('table .bmlt-in-progress-banner')).toBeVisible({ timeout: 15000 });
    await injectAxe(page);
    await checkA11y(page, '#crumb-widget');
  });
});
