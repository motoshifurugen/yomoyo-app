import { useMemo } from 'react';
import { useTheme } from './ThemeProvider';
import type { ThemeColors, ThemeGlass } from './themeTypes';

export type { ThemeColors, ThemeGlass } from './themeTypes';

export type MakeThemedStyles<T> = (colors: ThemeColors, glass: ThemeGlass) => T;

// Pass a stable (module-level) `makeStyles` reference, otherwise the memo
// invalidates every render and styles recompute on each tick.
export function useThemedStyles<T>(makeStyles: MakeThemedStyles<T>): T {
  const { colors, glass } = useTheme();
  return useMemo(() => makeStyles(colors, glass), [colors, glass, makeStyles]);
}
