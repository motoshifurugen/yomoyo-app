import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './locales/en';
import ja from './locales/ja';

export const LANGUAGE_STORAGE_KEY = 'yomoyo_language';

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

export async function setLanguage(lang: 'ja' | 'en'): Promise<void> {
  await Promise.all([
    i18n.changeLanguage(lang),
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang),
  ]);
}

export async function loadSavedLanguage(): Promise<'ja' | 'en' | null> {
  const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === 'ja' || saved === 'en') return saved;
  return null;
}

export function getCurrentLanguage(): 'ja' | 'en' {
  return i18n.language === 'ja' ? 'ja' : 'en';
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
