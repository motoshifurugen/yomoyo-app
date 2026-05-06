jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/theme/useSystemColorScheme', () => ({
  useSystemColorScheme: jest.fn(() => 'light'),
}));

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, screen, act } from '@testing-library/react-native';
import ScreenContainer from './ScreenContainer';
import { ThemeProvider } from '@/lib/theme';
import { useSystemColorScheme } from '@/lib/theme/useSystemColorScheme';
import { lightColors, darkColors } from '@/constants/yomoyoTheme';

const mockUseSystemColorScheme = useSystemColorScheme as jest.Mock;

beforeEach(() => {
  mockUseSystemColorScheme.mockReturnValue('light');
});

function renderInTheme(node: React.ReactNode) {
  return render(<ThemeProvider>{node}</ThemeProvider>);
}

describe('ScreenContainer', () => {
  it('renders children', () => {
    renderInTheme(
      <ScreenContainer>
        <Text>Hello</Text>
      </ScreenContainer>
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders with bottomInset without crashing', () => {
    renderInTheme(
      <ScreenContainer bottomInset={92}>
        <Text>With inset</Text>
      </ScreenContainer>
    );
    expect(screen.getByText('With inset')).toBeTruthy();
  });

  it('uses the light background when system scheme is light', async () => {
    mockUseSystemColorScheme.mockReturnValue('light');
    const { toJSON } = renderInTheme(
      <ScreenContainer>
        <Text>x</Text>
      </ScreenContainer>
    );
    await act(async () => {});
    const tree = toJSON() as { props: { style: unknown } };
    const flat = StyleSheet.flatten(tree.props.style) as { backgroundColor?: string };
    expect(flat.backgroundColor).toBe(lightColors.background);
  });

  it('uses the dark background when system scheme is dark', async () => {
    mockUseSystemColorScheme.mockReturnValue('dark');
    const { toJSON } = renderInTheme(
      <ScreenContainer>
        <Text>x</Text>
      </ScreenContainer>
    );
    await act(async () => {});
    const tree = toJSON() as { props: { style: unknown } };
    const flat = StyleSheet.flatten(tree.props.style) as { backgroundColor?: string };
    expect(flat.backgroundColor).toBe(darkColors.background);
  });
});
