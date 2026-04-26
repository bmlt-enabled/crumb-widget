export const GEOLOCATION_TIMEOUT_MS = 10000;

export const KM_PER_MILE = 1.60934;

export function milesToKm(miles: number): number {
  return miles * KM_PER_MILE;
}

export function kmToMiles(km: number): number {
  return km / KM_PER_MILE;
}
