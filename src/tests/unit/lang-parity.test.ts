import { describe, test, expect } from 'vitest';
import {
  daTranslations,
  deTranslations,
  elTranslations,
  enTranslations,
  esTranslations,
  faTranslations,
  frTranslations,
  itTranslations,
  plTranslations,
  ptTranslations,
  ruTranslations,
  svTranslations
} from '@/lang';

const refKeys = Object.keys(enTranslations).sort();

const others: Record<string, Record<string, unknown>> = {
  da: daTranslations,
  de: deTranslations,
  el: elTranslations,
  es: esTranslations,
  fa: faTranslations,
  fr: frTranslations,
  it: itTranslations,
  pl: plTranslations,
  pt: ptTranslations,
  ru: ruTranslations,
  sv: svTranslations
};

describe('translation parity', () => {
  for (const [lang, translations] of Object.entries(others)) {
    test(`${lang} has the same keys as en`, () => {
      expect(Object.keys(translations).sort()).toEqual(refKeys);
    });
  }
});
