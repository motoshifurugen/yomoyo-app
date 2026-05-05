import type { ThemeMode } from './themeStorage';

export type SystemScheme = 'light' | 'dark' | null | undefined;
export type ResolvedTheme = 'light' | 'dark';

export function resolveThemeMode(mode: ThemeMode, systemScheme: SystemScheme): ResolvedTheme {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}
