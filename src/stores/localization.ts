import LocalizedStrings from 'localized-strings';
import { writable } from 'svelte/store';
import {
  daTranslations,
  deTranslations,
  elTranslations,
  enTranslations,
  esTranslations,
  faTranslations,
  frTranslations,
  itTranslations,
  jaTranslations,
  plTranslations,
  ptTranslations,
  ruTranslations,
  svTranslations
} from '@/lang';

type Translations = typeof enTranslations;

const TRANSLATIONS = {
  da: daTranslations,
  de: deTranslations,
  el: elTranslations,
  en: enTranslations,
  es: esTranslations,
  fa: faTranslations,
  fr: frTranslations,
  it: itTranslations,
  ja: jaTranslations,
  pl: plTranslations,
  pt: ptTranslations,
  ru: ruTranslations,
  sv: svTranslations
};

export const SUPPORTED_LANGUAGES: readonly string[] = Object.keys(TRANSLATIONS);
const RTL_LANGUAGES: readonly string[] = ['ar', 'fa', 'he', 'ur'];

// `LocalizedStrings` declares `[key: string]: any`, so intersecting it into the
// store's value type would let any key — including one that does not exist —
// type-check as `any`. The widened type is therefore kept on the instance only
// (it needs the class methods for `ls.setLanguage`), while subscribers see the
// exact `Translations` shape, making a missing key a compile error.
const ls = new LocalizedStrings(TRANSLATIONS) as LocalizedStrings & Translations;

const { subscribe, set } = writable<Translations>(ls);
const dirStore = writable<'ltr' | 'rtl'>('ltr');
let resolvedLanguage = 'en';

// Store: use $t.someKey in components
export const t = { subscribe };

// Direction store: bind to the widget root's `dir` attribute so RTL languages
// (ar, fa, he, ur) flip the layout. Updated whenever initLocalization is called.
export const direction = { subscribe: dirStore.subscribe };

export function initLocalization(language: string): void {
  const base = (language.split('-')[0] ?? '').toLowerCase();
  const resolved = SUPPORTED_LANGUAGES.includes(base) ? base : 'en';
  resolvedLanguage = resolved;
  ls.setLanguage(resolved);
  dirStore.set(RTL_LANGUAGES.includes(resolved) ? 'rtl' : 'ltr');
  set(ls);
}

export function getLanguage(): string {
  return resolvedLanguage;
}

export function setLanguage(language: string): void {
  initLocalization(language);
}
