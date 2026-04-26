import { describe, test, expect, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { t, direction, setLanguage } from '@stores/localization';
import { daTranslations } from '@/lang/da';
import { deTranslations } from '@/lang/de';
import { elTranslations } from '@/lang/el';
import { enTranslations } from '@/lang/en';
import { esTranslations } from '@/lang/es';
import { faTranslations } from '@/lang/fa';
import { frTranslations } from '@/lang/fr';
import { itTranslations } from '@/lang/it';
import { plTranslations } from '@/lang/pl';
import { ptTranslations } from '@/lang/pt';
import { ruTranslations } from '@/lang/ru';
import { svTranslations } from '@/lang/sv';

afterEach(() => {
  setLanguage('en');
});

describe('language switching', () => {
  test('defaults to English', () => {
    expect(get(t).searchMeetings).toBe('Search meetings...');
  });

  test('switches to Spanish', () => {
    setLanguage('es');
    expect(get(t).searchMeetings).toBe('Buscar reuniones...');
  });

  test('switches to French', () => {
    setLanguage('fr');
    expect(get(t).searchMeetings).toBe('Rechercher des réunions...');
  });

  test('switches to German', () => {
    setLanguage('de');
    expect(get(t).searchMeetings).toBe('Treffen suchen...');
  });

  test('switches to Portuguese', () => {
    setLanguage('pt');
    expect(get(t).searchMeetings).toBe('Pesquisar reuniões...');
  });

  test('switches to Italian', () => {
    setLanguage('it');
    expect(get(t).searchMeetings).toBe('Cerca riunioni...');
  });

  test('switches to Swedish', () => {
    setLanguage('sv');
    expect(get(t).searchMeetings).toBe('Sök möten...');
  });

  test('switches to Danish', () => {
    setLanguage('da');
    expect(get(t).searchMeetings).toBe('Søg møder...');
  });

  test('switches to Russian', () => {
    setLanguage('ru');
    expect(get(t).searchMeetings).toBe('Поиск собраний...');
  });

  test('switches to Persian', () => {
    setLanguage('fa');
    expect(get(t).searchMeetings).toBe('جستجوی جلسات...');
  });

  test('switches to Greek', () => {
    setLanguage('el');
    expect(get(t).searchMeetings).toBe('Αναζήτηση συναντήσεων...');
  });

  test('switches to Polish', () => {
    setLanguage('pl');
    expect(get(t).searchMeetings).toBe('Szukaj mityngów...');
  });

  test('falls back to English for unknown language code', () => {
    setLanguage('xx');
    expect(get(t).searchMeetings).toBe('Search meetings...');
  });

  test('handles BCP 47 sub-tags like en-US', () => {
    setLanguage('en-US');
    expect(get(t).searchMeetings).toBe('Search meetings...');
  });

  test('handles BCP 47 sub-tags like es-MX', () => {
    setLanguage('es-MX');
    expect(get(t).searchMeetings).toBe('Buscar reuniones...');
  });
});

// All string keys from English that every language must provide
const stringKeys = (Object.keys(enTranslations) as (keyof typeof enTranslations)[]).filter((k) => typeof enTranslations[k] === 'string');

const allLanguages = [
  { lang: 'da', translations: daTranslations },
  { lang: 'de', translations: deTranslations },
  { lang: 'el', translations: elTranslations },
  { lang: 'en', translations: enTranslations },
  { lang: 'es', translations: esTranslations },
  { lang: 'fa', translations: faTranslations },
  { lang: 'fr', translations: frTranslations },
  { lang: 'it', translations: itTranslations },
  { lang: 'pl', translations: plTranslations },
  { lang: 'pt', translations: ptTranslations },
  { lang: 'ru', translations: ruTranslations },
  { lang: 'sv', translations: svTranslations }
];

describe('translation completeness', () => {
  for (const { lang, translations } of allLanguages) {
    test(`${lang}: all string keys are present and non-empty`, () => {
      for (const key of stringKeys) {
        const value = (translations as Record<string, unknown>)[key];
        expect(value, `${lang} missing key: ${key}`).toBeDefined();
        expect(typeof value, `${lang}.${key} should be a string`).toBe('string');
        expect((value as string).length, `${lang}.${key} should not be empty`).toBeGreaterThan(0);
      }
    });

    test(`${lang}: weekdays has exactly 7 non-empty entries`, () => {
      expect(translations.weekdays).toHaveLength(7);
      for (const day of translations.weekdays) {
        expect(day.length).toBeGreaterThan(0);
      }
    });

    test(`${lang}: weekdaysShort has exactly 7 non-empty entries`, () => {
      expect(translations.weekdaysShort).toHaveLength(7);
      for (const day of translations.weekdaysShort) {
        expect(day.length).toBeGreaterThan(0);
      }
    });

    test(`${lang}: weekdaysShort entries are shorter than or equal to weekdays entries`, () => {
      for (let i = 0; i < 7; i++) {
        expect(translations.weekdaysShort[i]!.length).toBeLessThanOrEqual(translations.weekdays[i]!.length);
      }
    });
  }
});

describe('direction store', () => {
  test('LTR languages report ltr', () => {
    for (const lang of ['da', 'de', 'el', 'en', 'es', 'fr', 'it', 'pl', 'pt', 'ru', 'sv']) {
      setLanguage(lang);
      expect(get(direction), `${lang} should be ltr`).toBe('ltr');
    }
  });

  test('Persian (fa) reports rtl', () => {
    setLanguage('fa');
    expect(get(direction)).toBe('rtl');
  });

  test('region-tagged RTL code (fa-IR) reports rtl', () => {
    setLanguage('fa-IR');
    expect(get(direction)).toBe('rtl');
  });

  test('falls back to ltr for unsupported language codes', () => {
    setLanguage('xx');
    expect(get(direction)).toBe('ltr');
  });
});
