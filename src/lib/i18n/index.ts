import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FALLBACK_LANGUAGE,
  LANGUAGE_RESOURCES,
  isSupportedLanguage,
  normalizeLanguage,
  type Language,
} from './languages';

export {
  SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
  FALLBACK_LANGUAGE,
  isSupportedLanguage,
  normalizeLanguage,
  type Language,
} from './languages';

export const LANGUAGE_STORAGE_KEY = 'yomoyo_language';

export function detectLanguage(
  locales: Array<{ languageCode: string | null }>
): Language {
  return normalizeLanguage(locales[0]?.languageCode);
}

function getDeviceLocales(): Array<{ languageCode: string | null }> {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return [{ languageCode: locale.split('-')[0] ?? null }];
  } catch {
    return [{ languageCode: FALLBACK_LANGUAGE }];
  }
}

export async function setLanguage(lang: Language): Promise<void> {
  await Promise.all([
    i18n.changeLanguage(lang),
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang),
  ]);
}

export async function loadSavedLanguage(): Promise<Language | null> {
  const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLanguage(saved) ? saved : null;
}

export function getCurrentLanguage(): Language {
  return normalizeLanguage(i18n.language);
}

const language = detectLanguage(getDeviceLocales());

i18n.use(initReactI18next).init({
  resources: LANGUAGE_RESOURCES,
  lng: language,
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: { escapeValue: false },
}).catch((error: unknown) => { throw error; });

export default i18n;
