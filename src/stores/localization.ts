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

// Typing the map as `Record<string, Translations>` makes every language file
// structurally checked against English, so a missing or misspelled key is a
// compile error rather than an `undefined` at runtime.
const TRANSLATIONS: Record<string, Translations> = {
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

const { subscribe, set } = writable<Translations>(enTranslations);
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
  dirStore.set(RTL_LANGUAGES.includes(resolved) ? 'rtl' : 'ltr');
  // Spread over English so any key a translation is missing falls back to it.
  set({ ...enTranslations, ...TRANSLATIONS[resolved] });
}

export function getLanguage(): string {
  return resolvedLanguage;
}

export function setLanguage(language: string): void {
  initLocalization(language);
}
