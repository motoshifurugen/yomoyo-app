import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import ja from './locales/ja';

export function detectLanguage(
  locales: Array<{ languageCode: string | null }>
): 'ja' | 'en' {
  const lang = locales[0]?.languageCode;
  return lang === 'ja' ? 'ja' : 'en';
}

function getDeviceLocales(): Array<{ languageCode: string | null }> {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return [{ languageCode: locale.split('-')[0] ?? null }];
  } catch {
    return [{ languageCode: 'en' }];
  }
}

const language = detectLanguage(getDeviceLocales());

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
