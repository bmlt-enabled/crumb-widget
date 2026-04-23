import { describe, test, expect } from 'vitest';
import { enTranslations, esTranslations, frTranslations, deTranslations, ptTranslations, itTranslations, svTranslations, daTranslations } from '@/lang';

const refKeys = Object.keys(enTranslations).sort();

const others: Record<string, Record<string, unknown>> = {
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
  pt: ptTranslations,
  it: itTranslations,
  sv: svTranslations,
  da: daTranslations
};

describe('translation parity', () => {
  for (const [lang, translations] of Object.entries(others)) {
    test(`${lang} has the same keys as en`, () => {
      expect(Object.keys(translations).sort()).toEqual(refKeys);
    });
  }
});
