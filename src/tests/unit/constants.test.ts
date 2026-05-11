import { describe, test, expect } from 'vitest';
import { detectDistanceUnit, milesToKm, kmToMiles } from '@utils/constants';

describe('milesToKm / kmToMiles', () => {
  test('round trips', () => {
    expect(milesToKm(1)).toBeCloseTo(1.60934, 5);
    expect(kmToMiles(1.60934)).toBeCloseTo(1, 5);
  });
});

describe('detectDistanceUnit', () => {
  test('US English → mi', () => {
    expect(detectDistanceUnit('en-US')).toBe('mi');
  });

  test('bare en maximizes to en-Latn-US → mi', () => {
    expect(detectDistanceUnit('en')).toBe('mi');
  });

  test('British English → mi', () => {
    expect(detectDistanceUnit('en-GB')).toBe('mi');
  });

  test('Australian English → km', () => {
    expect(detectDistanceUnit('en-AU')).toBe('km');
  });

  test('Canadian English → km', () => {
    expect(detectDistanceUnit('en-CA')).toBe('km');
  });

  test('German → km', () => {
    expect(detectDistanceUnit('de-DE')).toBe('km');
  });

  test('French → km', () => {
    expect(detectDistanceUnit('fr-FR')).toBe('km');
  });

  test('Liberia → mi', () => {
    expect(detectDistanceUnit('en-LR')).toBe('mi');
  });

  test('Myanmar → mi', () => {
    expect(detectDistanceUnit('my-MM')).toBe('mi');
  });

  test('falls back to mi on garbage input', () => {
    expect(detectDistanceUnit('not-a-locale-!!!')).toBe('mi');
  });
});
