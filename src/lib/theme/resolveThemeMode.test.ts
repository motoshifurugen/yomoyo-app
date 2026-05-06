import { resolveThemeMode } from '@/lib/theme/resolveThemeMode';

describe('resolveThemeMode', () => {
  it('returns "light" when mode is "light", regardless of system scheme', () => {
    expect(resolveThemeMode('light', 'dark')).toBe('light');
    expect(resolveThemeMode('light', 'light')).toBe('light');
    expect(resolveThemeMode('light', null)).toBe('light');
    expect(resolveThemeMode('light', undefined)).toBe('light');
  });

  it('returns "dark" when mode is "dark", regardless of system scheme', () => {
    expect(resolveThemeMode('dark', 'dark')).toBe('dark');
    expect(resolveThemeMode('dark', 'light')).toBe('dark');
    expect(resolveThemeMode('dark', null)).toBe('dark');
    expect(resolveThemeMode('dark', undefined)).toBe('dark');
  });

  it('follows system scheme when mode is "system" and scheme is "dark"', () => {
    expect(resolveThemeMode('system', 'dark')).toBe('dark');
  });

  it('follows system scheme when mode is "system" and scheme is "light"', () => {
    expect(resolveThemeMode('system', 'light')).toBe('light');
  });

  it('falls back to "light" when mode is "system" and scheme is null', () => {
    expect(resolveThemeMode('system', null)).toBe('light');
  });

  it('falls back to "light" when mode is "system" and scheme is undefined', () => {
    expect(resolveThemeMode('system', undefined)).toBe('light');
  });
});
