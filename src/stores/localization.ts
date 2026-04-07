import LocalizedStrings from 'localized-strings';
import { writable } from 'svelte/store';
import { enTranslations, esTranslations, frTranslations, deTranslations, ptTranslations, itTranslations, svTranslations, daTranslations } from '@/lang';

type Translations = typeof enTranslations;

const ls = new LocalizedStrings({
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
  pt: ptTranslations,
  it: itTranslations,
  sv: svTranslations,
  da: daTranslations
});

const { subscribe, set } = writable<Translations>(ls as unknown as Translations);

// Store: use $t.someKey in components
export const t = { subscribe };

export function initLocalization(language: string): void {
  const base = (language.split('-')[0] ?? '').toLowerCase();
  const available = ls.getAvailableLanguages() as string[];
  ls.setLanguage(available.includes(base) ? base : 'en');
  set(ls as unknown as Translations);
}

export function setLanguage(language: string): void {
  initLocalization(language);
}
