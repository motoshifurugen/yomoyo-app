import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  lightColors,
  darkColors,
  lightGlass,
  darkGlass,
} from '@/constants/yomoyoTheme';
import { loadSavedThemeMode, saveThemeMode, type ThemeMode } from './themeStorage';
import { resolveThemeMode, type ResolvedTheme } from './resolveThemeMode';
import { useSystemColorScheme } from './useSystemColorScheme';

type ThemeColors = typeof lightColors;
type ThemeGlass = typeof lightGlass;

type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  colors: ThemeColors;
  glass: ThemeGlass;
  setMode: (mode: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const COLORS_BY_RESOLVED: Record<ResolvedTheme, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

const GLASS_BY_RESOLVED: Record<ResolvedTheme, ThemeGlass> = {
  light: lightGlass,
  dark: darkGlass,
};

type Props = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: Props) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const systemScheme = useSystemColorScheme();

  useEffect(() => {
    loadSavedThemeMode()
      .then((saved) => {
        if (saved) setModeState(saved);
      })
      .catch(() => {
        // Storage failure shouldn't crash boot. Falls back to default 'system'.
      });
  }, []);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    await saveThemeMode(next);
  }, []);

  const resolved = resolveThemeMode(mode, systemScheme);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      resolved,
      colors: COLORS_BY_RESOLVED[resolved],
      glass: GLASS_BY_RESOLVED[resolved],
      setMode,
    }),
    [mode, resolved, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>.');
  }
  return ctx;
}
