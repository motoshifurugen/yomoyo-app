import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './locales/en';
import ja from './locales/ja';

// Pure function — exported for unit testing.
export function detectLanguage(
  locales: Array<{ languageCode: string | null }>
): 'ja' | 'en' {
  const lang = locales[0]?.languageCode;
  return lang === 'ja' ? 'ja' : 'en';
}

const language = detectLanguage(getLocales());

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: language,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
}).catch((error: unknown) => { throw error; });

export default i18n;
