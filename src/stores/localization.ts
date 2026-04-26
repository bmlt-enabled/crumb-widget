import LocalizedStrings from 'localized-strings';
import { writable } from 'svelte/store';
import { enTranslations, esTranslations, frTranslations, deTranslations, ptTranslations, itTranslations, svTranslations, daTranslations } from '@/lang';

type Translations = typeof enTranslations;
// localized-strings exposes translation keys via runtime proxy with `[key: string]: any`,
// so we widen the instance type once here and stay strongly typed everywhere else.
type LocalizedTranslations = LocalizedStrings & Translations;

const ls = new LocalizedStrings({
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  de: deTranslations,
  pt: ptTranslations,
  it: itTranslations,
  sv: svTranslations,
  da: daTranslations
}) as LocalizedTranslations;

const { subscribe, set } = writable<LocalizedTranslations>(ls);

// Store: use $t.someKey in components
export const t = { subscribe };

export function initLocalization(language: string): void {
  const base = (language.split('-')[0] ?? '').toLowerCase();
  const available = ls.getAvailableLanguages();
  ls.setLanguage(available.includes(base) ? base : 'en');
  set(ls);
}

export function setLanguage(language: string): void {
  initLocalization(language);
}
