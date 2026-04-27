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
// localized-strings exposes translation keys via runtime proxy with `[key: string]: any`,
// so we widen the instance type once here and stay strongly typed everywhere else.
type LocalizedTranslations = LocalizedStrings & Translations;

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

const ls = new LocalizedStrings(TRANSLATIONS) as LocalizedTranslations;

const { subscribe, set } = writable<LocalizedTranslations>(ls);
const dirStore = writable<'ltr' | 'rtl'>('ltr');

// Store: use $t.someKey in components
export const t = { subscribe };

// Direction store: bind to the widget root's `dir` attribute so RTL languages
// (ar, fa, he, ur) flip the layout. Updated whenever initLocalization is called.
export const direction = { subscribe: dirStore.subscribe };

export function initLocalization(language: string): void {
  const base = (language.split('-')[0] ?? '').toLowerCase();
  const resolved = SUPPORTED_LANGUAGES.includes(base) ? base : 'en';
  ls.setLanguage(resolved);
  dirStore.set(RTL_LANGUAGES.includes(resolved) ? 'rtl' : 'ltr');
  set(ls);
}

export function setLanguage(language: string): void {
  initLocalization(language);
}
