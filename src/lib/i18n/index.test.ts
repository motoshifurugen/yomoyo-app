jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

jest.mock('i18next', () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockResolvedValue(undefined),
  changeLanguage: jest.fn().mockResolvedValue(undefined),
}));

import i18n from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  detectLanguage,
  setLanguage,
  loadSavedLanguage,
  getCurrentLanguage,
  LANGUAGE_STORAGE_KEY,
} from '@/lib/i18n';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('detectLanguage', () => {
  it('returns ja for a Japanese device', () => {
    expect(detectLanguage([{ languageCode: 'ja' }])).toBe('ja');
  });

  it('returns en for an English device', () => {
    expect(detectLanguage([{ languageCode: 'en' }])).toBe('en');
  });

  it('returns en for an unsupported language', () => {
    expect(detectLanguage([{ languageCode: 'fr' }])).toBe('en');
  });

  it('returns en when the locales array is empty', () => {
    expect(detectLanguage([])).toBe('en');
  });

  it('returns en when languageCode is null', () => {
    expect(detectLanguage([{ languageCode: null }])).toBe('en');
  });
});

describe('setLanguage', () => {
  it('calls i18n.changeLanguage with ja', async () => {
    await setLanguage('ja');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('ja');
  });

  it('persists ja to AsyncStorage', async () => {
    await setLanguage('ja');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY, 'ja');
  });

  it('calls i18n.changeLanguage with en', async () => {
    await setLanguage('en');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
  });

  it('persists en to AsyncStorage', async () => {
    await setLanguage('en');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY, 'en');
  });
});

describe('getCurrentLanguage', () => {
  it("returns 'ja' when i18n.language is 'ja'", () => {
    (i18n as unknown as { language: string }).language = 'ja';
    expect(getCurrentLanguage()).toBe('ja');
  });

  it("returns 'en' when i18n.language is 'en'", () => {
    (i18n as unknown as { language: string }).language = 'en';
    expect(getCurrentLanguage()).toBe('en');
  });

  it("returns 'en' as fallback for unsupported values", () => {
    (i18n as unknown as { language: string }).language = 'fr';
    expect(getCurrentLanguage()).toBe('en');
  });

  it("returns 'en' when i18n.language is undefined", () => {
    (i18n as unknown as { language: string | undefined }).language = undefined;
    expect(getCurrentLanguage()).toBe('en');
  });
});

describe('loadSavedLanguage', () => {
  it('returns ja when AsyncStorage has ja', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('ja');
    expect(await loadSavedLanguage()).toBe('ja');
  });

  it('returns en when AsyncStorage has en', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('en');
    expect(await loadSavedLanguage()).toBe('en');
  });

  it('returns null when nothing is saved', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    expect(await loadSavedLanguage()).toBeNull();
  });

  it('returns null for an unrecognized saved value', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('fr');
    expect(await loadSavedLanguage()).toBeNull();
  });
});
