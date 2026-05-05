import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEME_STORAGE_KEY = 'yomoyo_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

const VALID_MODES: readonly ThemeMode[] = ['light', 'dark', 'system'];

function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (VALID_MODES as readonly string[]).includes(value);
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
}

export async function loadSavedThemeMode(): Promise<ThemeMode | null> {
  const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
  return isThemeMode(saved) ? saved : null;
}
