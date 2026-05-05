import type { Column, ViewType } from '@/types';

const PREFIX = '[crumb-widget]';
const VIEWS: readonly ViewType[] = ['list', 'map', 'both'];
const COLUMNS: readonly Column[] = ['time', 'name', 'location', 'address', 'service_body'];

function warn(field: string, value: unknown, expected: string, fallback: unknown): void {
  console.warn(`${PREFIX} invalid ${field} (${JSON.stringify(value)}); expected ${expected}. Using ${JSON.stringify(fallback)}.`);
}

const isPositive = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
const isNonNegative = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

export function validView(value: unknown, fallback: ViewType): ViewType {
  if (value == null) return fallback;
  if (typeof value === 'string' && (VIEWS as readonly string[]).includes(value)) return value as ViewType;
  warn('view', value, "'list', 'map', or 'both'", fallback);
  return fallback;
}

export function validPositive(field: string, value: unknown, fallback: number): number {
  if (value == null) return fallback;
  if (isPositive(value)) return value;
  warn(field, value, 'a positive number', fallback);
  return fallback;
}

export function validNonNegative(field: string, value: unknown, fallback: number): number {
  if (value == null) return fallback;
  if (isNonNegative(value)) return value;
  warn(field, value, 'a non-negative number', fallback);
  return fallback;
}

export function validHeight(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (isPositive(value)) return value;
  warn('height', value, 'a positive number', 'auto');
  return undefined;
}

export function validDistanceUnit(value: unknown, fallback: 'mi' | 'km'): 'mi' | 'km' {
  if (value == null) return fallback;
  if (value === 'mi' || value === 'km') return value;
  warn('distanceUnit', value, "'mi' or 'km'", fallback);
  return fallback;
}

export function validDistanceOptions(value: unknown, fallback: number[]): number[] {
  if (value == null) return [...fallback];
  if (Array.isArray(value) && value.length > 0 && value.every(isPositive)) return value;
  warn('distanceOptions', value, 'a non-empty array of positive numbers', fallback);
  return [...fallback];
}

export function validColumns(value: unknown, fallback: Column[]): Column[] {
  if (value == null) return [...fallback];
  if (Array.isArray(value) && value.length > 0 && value.every((x): x is Column => (COLUMNS as readonly string[]).includes(x as string))) {
    return value;
  }
  warn('columns', value, `a non-empty array of ${COLUMNS.join('|')}`, fallback);
  return [...fallback];
}

export function validDarkMode(value: unknown, fallback: 'auto' | true | false): 'auto' | true | false {
  if (value == null) return fallback;
  if (typeof value === 'boolean' || value === 'auto') return value;
  warn('darkMode', value, "true, false, or 'auto'", fallback);
  return fallback;
}

export function validBoolean(field: string, value: unknown, fallback: boolean): boolean {
  if (value == null) return fallback;
  if (typeof value === 'boolean') return value;
  // WordPress serializes booleans as "1" / "0"
  if (value === '1' || value === 'true') return true;
  if (value === '0' || value === 'false') return false;
  warn(field, value, 'a boolean', fallback);
  return fallback;
}

/**
 * Validates an explicitly configured language code. Returns `undefined` for nullish
 * values so callers can fall back to `navigator.language`. Warns and returns
 * `undefined` for non-string or unsupported codes — those are user-facing config
 * mistakes worth flagging. Auto-detected `navigator.language` codes are not run
 * through this function, so unsupported browser locales fall back silently.
 */
export function validLanguage(value: unknown, supported: readonly string[]): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== 'string') {
    warn('language', value, 'a string', 'auto-detect');
    return undefined;
  }
  const base = (value.split('-')[0] ?? '').toLowerCase();
  if (!supported.includes(base)) {
    warn('language', value, `one of ${supported.join(', ')}`, 'auto-detect');
    return undefined;
  }
  return value;
}

export function validServerUrl(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    return '';
  }
  if (!URL.canParse(value)) {
    warn('serverUrl', value, 'a valid URL', '');
    return '';
  }
  return value;
}

export function parseServiceBodyIds(value: string): number[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function parseFormatIds(value: string): number[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function parseFormatKeys(value: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function validFormatKeys(value: unknown, fallback: string[]): string[] {
  if (value == null) return [...fallback];
  if (Array.isArray(value) && value.every((x) => typeof x === 'string' && x.trim().length > 0)) {
    return (value as string[]).map((s) => s.trim());
  }
  warn('formats', value, 'an array of non-empty strings', fallback);
  return [...fallback];
}
