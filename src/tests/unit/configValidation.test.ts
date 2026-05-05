import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseFormatIds,
  parseFormatKeys,
  parseServiceBodyIds,
  validBoolean,
  validColumns,
  validDarkMode,
  validDistanceOptions,
  validDistanceUnit,
  validFormatKeys,
  validHeight,
  validLanguage,
  validNonNegative,
  validPositive,
  validServerUrl,
  validView
} from '@utils/configValidation';

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe('validView', () => {
  test('accepts valid views', () => {
    expect(validView('list', 'list')).toBe('list');
    expect(validView('map', 'list')).toBe('map');
    expect(validView('both', 'list')).toBe('both');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('returns fallback for nullish values without warning', () => {
    expect(validView(undefined, 'map')).toBe('map');
    expect(validView(null, 'map')).toBe('map');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('warns and falls back on invalid value', () => {
    expect(validView('banana', 'list')).toBe('list');
    expect(validView(42, 'list')).toBe('list');
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});

describe('validPositive', () => {
  test('accepts positive numbers', () => {
    expect(validPositive('field', 5, 10)).toBe(5);
    expect(validPositive('field', 0.5, 10)).toBe(0.5);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('returns fallback for nullish without warning', () => {
    expect(validPositive('field', undefined, 10)).toBe(10);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('warns on zero, negative, NaN, infinity, non-number', () => {
    expect(validPositive('field', 0, 10)).toBe(10);
    expect(validPositive('field', -5, 10)).toBe(10);
    expect(validPositive('field', NaN, 10)).toBe(10);
    expect(validPositive('field', Infinity, 10)).toBe(10);
    expect(validPositive('field', 'five', 10)).toBe(10);
    expect(warnSpy).toHaveBeenCalledTimes(5);
  });
});

describe('validNonNegative', () => {
  test('accepts zero and positive', () => {
    expect(validNonNegative('field', 0, 10)).toBe(0);
    expect(validNonNegative('field', 5, 10)).toBe(5);
  });

  test('warns on negative', () => {
    expect(validNonNegative('field', -1, 10)).toBe(10);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});

describe('validHeight', () => {
  test('returns undefined for nullish', () => {
    expect(validHeight(undefined)).toBeUndefined();
    expect(validHeight(null)).toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('accepts positive height', () => {
    expect(validHeight(500)).toBe(500);
  });

  test('warns and returns undefined for invalid', () => {
    expect(validHeight(0)).toBeUndefined();
    expect(validHeight(-100)).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});

describe('validDistanceUnit', () => {
  test("accepts 'mi' and 'km'", () => {
    expect(validDistanceUnit('mi', 'km')).toBe('mi');
    expect(validDistanceUnit('km', 'mi')).toBe('km');
  });

  test('warns on other strings', () => {
    expect(validDistanceUnit('miles', 'mi')).toBe('mi');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});

describe('validDistanceOptions', () => {
  test('accepts non-empty array of positive numbers', () => {
    expect(validDistanceOptions([5, 10, 25], [1])).toEqual([5, 10, 25]);
  });

  test('returns a fresh copy of the fallback for nullish', () => {
    const fallback = [1, 2, 3];
    const result = validDistanceOptions(undefined, fallback);
    expect(result).toEqual([1, 2, 3]);
    expect(result).not.toBe(fallback);
  });

  test('warns on empty array, non-array, or array with invalid entries', () => {
    expect(validDistanceOptions([], [1])).toEqual([1]);
    expect(validDistanceOptions([5, -1, 10], [1])).toEqual([1]);
    expect(validDistanceOptions('5,10', [1])).toEqual([1]);
    expect(warnSpy).toHaveBeenCalledTimes(3);
  });
});

describe('validColumns', () => {
  test('accepts valid columns', () => {
    expect(validColumns(['time', 'name'], ['time'])).toEqual(['time', 'name']);
  });

  test('warns on unknown columns', () => {
    expect(validColumns(['time', 'foo'], ['time'])).toEqual(['time']);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  test('warns on empty array', () => {
    expect(validColumns([], ['time'])).toEqual(['time']);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});

describe('validDarkMode', () => {
  test('accepts true, false, and "auto"', () => {
    expect(validDarkMode(true, false)).toBe(true);
    expect(validDarkMode(false, true)).toBe(false);
    expect(validDarkMode('auto', false)).toBe('auto');
  });

  test('warns on other strings', () => {
    expect(validDarkMode('on', false)).toBe(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});

describe('validBoolean', () => {
  test('accepts boolean', () => {
    expect(validBoolean('field', true, false)).toBe(true);
    expect(validBoolean('field', false, true)).toBe(false);
  });

  test('accepts WordPress string "1"/"0" and "true"/"false"', () => {
    expect(validBoolean('field', '1', false)).toBe(true);
    expect(validBoolean('field', '0', true)).toBe(false);
    expect(validBoolean('field', 'true', false)).toBe(true);
    expect(validBoolean('field', 'false', true)).toBe(false);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('warns on non-boolean', () => {
    expect(validBoolean('field', 1, false)).toBe(false);
    expect(validBoolean('field', 'yes', false)).toBe(false);
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});

describe('validLanguage', () => {
  const supported = ['en', 'es', 'fr'];

  test('returns undefined for nullish without warning', () => {
    expect(validLanguage(undefined, supported)).toBeUndefined();
    expect(validLanguage(null, supported)).toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('accepts a supported base code', () => {
    expect(validLanguage('en', supported)).toBe('en');
    expect(validLanguage('es', supported)).toBe('es');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('accepts a region-tagged code with supported base', () => {
    expect(validLanguage('en-US', supported)).toBe('en-US');
    expect(validLanguage('es-MX', supported)).toBe('es-MX');
    expect(validLanguage('FR-ca', supported)).toBe('FR-ca');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('warns and returns undefined for unsupported language', () => {
    expect(validLanguage('zh', supported)).toBeUndefined();
    expect(validLanguage('zh-CN', supported)).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  test('warns and returns undefined for non-string', () => {
    expect(validLanguage(42, supported)).toBeUndefined();
    expect(validLanguage({}, supported)).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });
});

describe('validServerUrl', () => {
  test('accepts valid URL', () => {
    expect(validServerUrl('https://bmlt.example.org/main_server')).toBe('https://bmlt.example.org/main_server');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('returns empty string silently for empty input', () => {
    expect(validServerUrl('')).toBe('');
    expect(validServerUrl(undefined)).toBe('');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('warns on unparsable URL', () => {
    expect(validServerUrl('not a url')).toBe('');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});

describe('parseServiceBodyIds', () => {
  test('parses a comma-separated list', () => {
    expect(parseServiceBodyIds('1,2,3')).toEqual([1, 2, 3]);
  });

  test('trims whitespace', () => {
    expect(parseServiceBodyIds(' 1 , 2 , 3 ')).toEqual([1, 2, 3]);
  });

  test('drops non-positive and non-numeric entries', () => {
    expect(parseServiceBodyIds('1,foo,-2,0,3')).toEqual([1, 3]);
  });

  test('returns empty array for empty string', () => {
    expect(parseServiceBodyIds('')).toEqual([]);
  });
});

describe('parseFormatIds', () => {
  test('parses a comma-separated list', () => {
    expect(parseFormatIds('1,5,12')).toEqual([1, 5, 12]);
  });

  test('drops invalid entries', () => {
    expect(parseFormatIds('1,bad,-3,0,7')).toEqual([1, 7]);
  });

  test('returns empty array for empty string', () => {
    expect(parseFormatIds('')).toEqual([]);
  });
});

describe('parseFormatKeys', () => {
  test('parses a comma-separated list', () => {
    expect(parseFormatKeys('O,BT,WC')).toEqual(['O', 'BT', 'WC']);
  });

  test('trims whitespace and drops empty entries', () => {
    expect(parseFormatKeys(' O , , BT ')).toEqual(['O', 'BT']);
  });

  test('returns empty array for empty string', () => {
    expect(parseFormatKeys('')).toEqual([]);
  });
});

describe('validFormatKeys', () => {
  test('accepts an array of strings', () => {
    expect(validFormatKeys(['O', 'BT'], [])).toEqual(['O', 'BT']);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('returns fallback for nullish without warning', () => {
    expect(validFormatKeys(undefined, ['O'])).toEqual(['O']);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('warns and falls back when array contains non-strings', () => {
    expect(validFormatKeys(['O', 42], [])).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  test('warns and falls back when array contains empty strings', () => {
    expect(validFormatKeys(['O', ''], [])).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  test('warns and falls back for non-array', () => {
    expect(validFormatKeys('O,BT', [])).toEqual([]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
