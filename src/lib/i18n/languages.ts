import en from './locales/en';
import ja from './locales/ja';

// Single source of truth for supported languages.
//
// To add a language:
//   1. create ./locales/<code>.ts
//   2. add it to LOCALE_BUNDLES and LANGUAGE_LABELS below
// Everything else (the Language type, i18next resources, device detection,
// and the settings UI) derives from here, so no other file needs editing.
const LOCALE_BUNDLES = { ja, en } as const;

export type Language = keyof typeof LOCALE_BUNDLES;

export const SUPPORTED_LANGUAGES = Object.keys(LOCALE_BUNDLES) as Language[];

export const FALLBACK_LANGUAGE: Language = 'en';

// Native display names, shown as-is regardless of the active UI language.
export const LANGUAGE_LABELS: Record<Language, string> = {
  ja: '日本語',
  en: 'English',
};

export const LANGUAGE_RESOURCES = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((lng) => [lng, { translation: LOCALE_BUNDLES[lng] }]),
) as Record<Language, { translation: (typeof LOCALE_BUNDLES)[Language] }>;

export function isSupportedLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as string[]).includes(value);
}

export function normalizeLanguage(code: string | null | undefined): Language {
  return isSupportedLanguage(code) ? code : FALLBACK_LANGUAGE;
}
