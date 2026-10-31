/**
 * Geocoding via the BMLT geocoding service (https://geo.aws.bmlt.app).
 *
 * This is an optional alternative to the Nominatim geocoding performed by
 * `bmlt-query-client`'s `client.geocodeAddress()`. It is used only when an API
 * key is configured (see {@link import('@/types').CrumbWidgetConfig.geoApi}).
 *
 * The return shape intentionally mirrors `client.geocodeAddress()` so the two
 * providers are interchangeable at the single call site in `data.svelte.ts`:
 * `{ coordinates: { latitude, longitude }, display_name }`.
 *
 * The service wraps Google's Geocoding API, so a success body is Google-shaped
 * with a `status` ("OK" | "ZERO_RESULTS") and a `results` array. Coordinates
 * live at `results[0].geometry.location.{lat,lng}`.
 */

export interface GeoApiGeocodeOptions {
  /** Base URL of the service, e.g. `https://geo.aws.bmlt.app` (no trailing slash). */
  baseUrl: string;
  /** Bearer API key (`geo_...`). */
  apiKey: string;
  /** Analytics identifier sent as the `application` param. */
  application: string;
  /** The address/city/zip to geocode (already trimmed by the caller). */
  search: string;
  /** Optional BCP-47 language tag to bias results. */
  language?: string;
}

/** Client-compatible geocode result (matches `client.geocodeAddress()`). */
export interface GeocodeResult {
  coordinates: { latitude: number; longitude: number };
  display_name: string;
}

interface GeoApiLocation {
  lat: number;
  lng: number;
}

interface GeoApiResult {
  formatted_address?: string;
  geometry?: { location?: GeoApiLocation };
}

interface GeoApiResponse {
  status?: string;
  results?: GeoApiResult[];
}

/**
 * Geocode `search` through the BMLT geocoding service.
 *
 * @returns the resolved coordinates + display name, or `null` when the service
 *   returns no match (`ZERO_RESULTS` or an empty `results` array).
 * @throws on network failure or a non-OK HTTP response (e.g. 401 invalid key,
 *   429 rate-limited). The caller maps thrown errors to its user-facing
 *   "location not found" message, matching the Nominatim path's behavior.
 */
export async function geocodeViaGeoApi(options: GeoApiGeocodeOptions): Promise<GeocodeResult | null> {
  const { baseUrl, apiKey, application, search, language } = options;

  const params = new URLSearchParams({
    application,
    search,
    // The service requires a valid URL referrer (used for region bias + analytics).
    referrer: typeof window !== 'undefined' ? window.location.href : baseUrl
  });
  if (language) params.set('language', language);

  const res = await fetch(`${baseUrl}/api/geocode?${params.toString()}`, {
    headers: { Authorization: `Bearer ${apiKey}` }
  });

  if (!res.ok) {
    throw new Error(`Geo API request failed (${res.status})`);
  }

  const body = (await res.json()) as GeoApiResponse;
  const first = body.results?.[0];
  const location = first?.geometry?.location;
  if (body.status !== 'OK' || !location) {
    return null;
  }

  return {
    coordinates: { latitude: location.lat, longitude: location.lng },
    display_name: first?.formatted_address ?? search
  };
}
