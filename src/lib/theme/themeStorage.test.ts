jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveThemeMode,
  loadSavedThemeMode,
  THEME_STORAGE_KEY,
} from '@/lib/theme/themeStorage';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('THEME_STORAGE_KEY', () => {
  it('uses the yomoyo_theme namespace', () => {
    expect(THEME_STORAGE_KEY).toBe('yomoyo_theme');
  });
});

describe('saveThemeMode', () => {
  it('persists "light" under THEME_STORAGE_KEY', async () => {
    await saveThemeMode('light');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'light');
  });

  it('persists "dark"', async () => {
    await saveThemeMode('dark');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
  });

  it('persists "system"', async () => {
    await saveThemeMode('system');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'system');
  });
});

describe('loadSavedThemeMode', () => {
  it('returns "light" when storage has "light"', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('light');
    expect(await loadSavedThemeMode()).toBe('light');
  });

  it('returns "dark" when storage has "dark"', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('dark');
    expect(await loadSavedThemeMode()).toBe('dark');
  });

  it('returns "system" when storage has "system"', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('system');
    expect(await loadSavedThemeMode()).toBe('system');
  });

  it('returns null when nothing is saved', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    expect(await loadSavedThemeMode()).toBeNull();
  });

  it('returns null for an unrecognized stored value', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('sepia');
    expect(await loadSavedThemeMode()).toBeNull();
  });

  it('returns null for an empty string', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('');
    expect(await loadSavedThemeMode()).toBeNull();
  });
});
