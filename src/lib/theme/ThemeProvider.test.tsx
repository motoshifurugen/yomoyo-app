jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/theme/useSystemColorScheme', () => ({
  useSystemColorScheme: jest.fn(() => 'light'),
}));

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '@/lib/theme/ThemeProvider';
import { useSystemColorScheme } from '@/lib/theme/useSystemColorScheme';
import { lightColors, darkColors, lightGlass, darkGlass } from '@/constants/yomoyoTheme';
import { THEME_STORAGE_KEY } from '@/lib/theme/themeStorage';

const mockUseSystemColorScheme = useSystemColorScheme as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSystemColorScheme.mockReturnValue('light');
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('useTheme — defaults', () => {
  it('starts with mode "system" when nothing is saved', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    await act(async () => {});
    expect(result.current.mode).toBe('system');
  });

  it('exposes lightColors / lightGlass when system scheme is light', async () => {
    mockUseSystemColorScheme.mockReturnValue('light');
    const { result } = renderHook(() => useTheme(), { wrapper });
    await act(async () => {});
    expect(result.current.resolved).toBe('light');
    expect(result.current.colors).toBe(lightColors);
    expect(result.current.glass).toBe(lightGlass);
  });

  it('exposes darkColors / darkGlass when system scheme is dark', async () => {
    mockUseSystemColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() => useTheme(), { wrapper });
    await act(async () => {});
    expect(result.current.resolved).toBe('dark');
    expect(result.current.colors).toBe(darkColors);
    expect(result.current.glass).toBe(darkGlass);
  });
});

describe('useTheme — restore from storage', () => {
  it('restores "dark" when storage has "dark"', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('dark');
    mockUseSystemColorScheme.mockReturnValue('light'); // user pref overrides system
    const { result } = renderHook(() => useTheme(), { wrapper });
    await act(async () => {});
    expect(result.current.mode).toBe('dark');
    expect(result.current.resolved).toBe('dark');
    expect(result.current.colors).toBe(darkColors);
  });

  it('restores "light" when storage has "light"', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('light');
    mockUseSystemColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() => useTheme(), { wrapper });
    await act(async () => {});
    expect(result.current.mode).toBe('light');
    expect(result.current.resolved).toBe('light');
  });

  it('keeps "system" when storage has "system" and follows OS', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('system');
    mockUseSystemColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() => useTheme(), { wrapper });
    await act(async () => {});
    expect(result.current.mode).toBe('system');
    expect(result.current.resolved).toBe('dark');
  });

  it('ignores invalid storage values and stays on default', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('sepia');
    const { result } = renderHook(() => useTheme(), { wrapper });
    await act(async () => {});
    expect(result.current.mode).toBe('system');
  });
});

describe('useTheme — setMode', () => {
  it('updates mode and persists to storage', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current.setMode('dark');
    });

    expect(result.current.mode).toBe('dark');
    expect(result.current.resolved).toBe('dark');
    expect(result.current.colors).toBe(darkColors);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
  });

  it('switches back to system mode and re-follows OS', async () => {
    mockUseSystemColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() => useTheme(), { wrapper });
    await act(async () => {});

    await act(async () => {
      await result.current.setMode('light');
    });
    expect(result.current.resolved).toBe('light');

    await act(async () => {
      await result.current.setMode('system');
    });
    expect(result.current.mode).toBe('system');
    expect(result.current.resolved).toBe('dark');
    expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(THEME_STORAGE_KEY, 'system');
  });
});

describe('useTheme — system scheme changes', () => {
  it('re-resolves when the OS scheme changes while in system mode', async () => {
    mockUseSystemColorScheme.mockReturnValue('light');
    const { result, rerender } = renderHook(() => useTheme(), { wrapper });
    await act(async () => {});
    expect(result.current.resolved).toBe('light');

    mockUseSystemColorScheme.mockReturnValue('dark');
    rerender({});
    expect(result.current.resolved).toBe('dark');
    expect(result.current.colors).toBe(darkColors);
  });

  it('does NOT change resolved when in explicit light mode and OS toggles', async () => {
    mockUseSystemColorScheme.mockReturnValue('light');
    const { result, rerender } = renderHook(() => useTheme(), { wrapper });
    await act(async () => {
      await result.current.setMode('light');
    });

    mockUseSystemColorScheme.mockReturnValue('dark');
    rerender({});

    expect(result.current.resolved).toBe('light');
  });
});

describe('useTheme — usage outside provider', () => {
  it('throws a clear error when called without ThemeProvider', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/);
    errorSpy.mockRestore();
  });
});
