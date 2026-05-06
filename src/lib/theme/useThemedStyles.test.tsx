jest.mock('@/lib/theme/ThemeProvider', () => ({
  useTheme: jest.fn(),
}));

import { renderHook } from '@testing-library/react-native';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { useThemedStyles } from '@/lib/theme/useThemedStyles';
import { lightColors, darkColors, lightGlass, darkGlass } from '@/constants/yomoyoTheme';

const mockUseTheme = useTheme as jest.Mock;

function lightTheme() {
  return {
    mode: 'light',
    resolved: 'light',
    colors: lightColors,
    glass: lightGlass,
    setMode: jest.fn(),
  };
}

function darkTheme() {
  return {
    mode: 'dark',
    resolved: 'dark',
    colors: darkColors,
    glass: darkGlass,
    setMode: jest.fn(),
  };
}

beforeEach(() => {
  mockUseTheme.mockReset();
});

describe('useThemedStyles', () => {
  it('invokes makeStyles with the active colors and glass', () => {
    mockUseTheme.mockReturnValue(lightTheme());
    const makeStyles = jest.fn((c, g) => ({ bg: c.background, glassBg: g.background }));

    const { result } = renderHook(() => useThemedStyles(makeStyles));

    expect(makeStyles).toHaveBeenCalledWith(lightColors, lightGlass);
    expect(result.current.bg).toBe(lightColors.background);
    expect(result.current.glassBg).toBe(lightGlass.background);
  });

  it('returns the same result reference across re-renders when theme is unchanged', () => {
    mockUseTheme.mockReturnValue(lightTheme());
    const makeStyles = jest.fn((c) => ({ bg: c.background }));

    const { result, rerender } = renderHook(() => useThemedStyles(makeStyles));
    const first = result.current;

    rerender({});
    const second = result.current;

    expect(second).toBe(first);
    expect(makeStyles).toHaveBeenCalledTimes(1);
  });

  it('recomputes when the theme switches from light to dark', () => {
    mockUseTheme.mockReturnValue(lightTheme());
    const makeStyles = jest.fn((c) => ({ bg: c.background }));

    const { result, rerender } = renderHook(() => useThemedStyles(makeStyles));
    const lightResult = result.current;
    expect(lightResult.bg).toBe(lightColors.background);

    mockUseTheme.mockReturnValue(darkTheme());
    rerender({});

    expect(result.current.bg).toBe(darkColors.background);
    expect(result.current).not.toBe(lightResult);
    expect(makeStyles).toHaveBeenCalledTimes(2);
  });
});
