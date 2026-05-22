export const GEOLOCATION_TIMEOUT_MS = 10000;

// Wall-clock ceiling for the location prompt. The browser-level timeout in
// getCurrentPosition only starts counting after the user dismisses the
// permission prompt — if the prompt is ignored or silently suppressed
// (sandboxed iframe, blocked Permissions Policy, etc.) the callback never
// fires. This JS-side timer guarantees the spinner cannot hang forever.
export const GEOLOCATION_HARD_TIMEOUT_MS = 15000;

const KM_PER_MILE = 1.60934;

export function milesToKm(miles: number): number {
  return miles * KM_PER_MILE;
}

export function kmToMiles(km: number): number {
  return km / KM_PER_MILE;
}

// Regions that use miles for road distance.
const MILE_REGIONS = new Set(['US', 'LR', 'MM', 'GB']);

// Derive 'mi'/'km' from a BCP-47 language tag. Uses Intl.Locale#maximize() so a
// bare 'en' (no region) resolves to 'en-Latn-US' → mi. Falls back to 'mi' on any
// parse error.
export function detectDistanceUnit(lang: string): 'mi' | 'km' {
  try {
    const region = new Intl.Locale(lang).maximize().region;
    return region != null && MILE_REGIONS.has(region) ? 'mi' : 'km';
  } catch {
    return 'mi';
  }
}
