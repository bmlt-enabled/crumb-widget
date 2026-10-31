import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { geocodeViaGeoApi } from '@utils/geocode';

const OK_BODY = {
  status: 'OK',
  type: 'live',
  results: [
    {
      formatted_address: 'Chicago, IL, USA',
      geometry: { location: { lat: 41.88325, lng: -87.6323879 } }
    }
  ]
};

function mockFetch(response: { ok: boolean; status?: number; json?: unknown }): ReturnType<typeof vi.fn> {
  const fn = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status ?? 200,
    json: async () => response.json
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

beforeEach(() => {
  window.history.replaceState(null, '', '/widget-page');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('geocodeViaGeoApi', () => {
  test('maps a successful response to the client-compatible shape', async () => {
    mockFetch({ ok: true, json: OK_BODY });
    const result = await geocodeViaGeoApi({
      baseUrl: 'https://geo.aws.bmlt.app',
      apiKey: 'geo_test',
      application: 'crumb-widget',
      search: 'Chicago, IL'
    });
    expect(result).toEqual({
      coordinates: { latitude: 41.88325, longitude: -87.6323879 },
      display_name: 'Chicago, IL, USA'
    });
  });

  test('sends application, search, referrer, language and the Bearer header', async () => {
    const fetchFn = mockFetch({ ok: true, json: OK_BODY });
    await geocodeViaGeoApi({
      baseUrl: 'https://geo.aws.bmlt.app',
      apiKey: 'geo_test',
      application: 'my-app',
      search: '02539',
      language: 'es'
    });
    const [url, init] = fetchFn.mock.calls[0] ?? [];
    const parsed = new URL(url as string);
    expect(parsed.origin + parsed.pathname).toBe('https://geo.aws.bmlt.app/api/geocode');
    expect(parsed.searchParams.get('application')).toBe('my-app');
    expect(parsed.searchParams.get('search')).toBe('02539');
    expect(parsed.searchParams.get('language')).toBe('es');
    expect(parsed.searchParams.get('referrer')).toContain('/widget-page');
    expect((init as RequestInit).headers).toEqual({ Authorization: 'Bearer geo_test' });
  });

  test('omits language when not provided', async () => {
    const fetchFn = mockFetch({ ok: true, json: OK_BODY });
    await geocodeViaGeoApi({ baseUrl: 'https://geo.aws.bmlt.app', apiKey: 'geo_test', application: 'crumb-widget', search: 'Chicago' });
    const [url] = fetchFn.mock.calls[0] ?? [];
    expect(new URL(url as string).searchParams.has('language')).toBe(false);
  });

  test('returns null on ZERO_RESULTS', async () => {
    mockFetch({ ok: true, json: { status: 'ZERO_RESULTS', results: [] } });
    const result = await geocodeViaGeoApi({ baseUrl: 'https://geo.aws.bmlt.app', apiKey: 'geo_test', application: 'crumb-widget', search: 'asdfqwer' });
    expect(result).toBeNull();
  });

  test('throws on a non-OK HTTP response (e.g. 401 invalid key)', async () => {
    mockFetch({ ok: false, status: 401, json: { message: 'Invalid or revoked API key.' } });
    await expect(geocodeViaGeoApi({ baseUrl: 'https://geo.aws.bmlt.app', apiKey: 'bad', application: 'crumb-widget', search: 'Chicago' })).rejects.toThrow(/401/);
  });

  test('throws on a 429 rate-limit response', async () => {
    mockFetch({ ok: false, status: 429, json: { message: 'Too Many Requests' } });
    await expect(geocodeViaGeoApi({ baseUrl: 'https://geo.aws.bmlt.app', apiKey: 'geo_test', application: 'crumb-widget', search: 'Chicago' })).rejects.toThrow(/429/);
  });
});
