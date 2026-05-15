import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import MainTabNavigator from './MainTabNavigator';

type CapturedScreen = {
  name: string;
  options: Record<string, unknown>;
};

const capturedScreens: CapturedScreen[] = [];

jest.mock('@react-navigation/bottom-tabs', () => {
  const actual = jest.requireActual('@react-navigation/bottom-tabs');
  const React = require('react');
  const { View } = require('react-native');
  return {
    ...actual,
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: { children: React.ReactNode }) =>
        React.createElement(View, null, children),
      Screen: ({ name, options }: { name: string; options: unknown }) => {
        capturedScreens.push({
          name,
          options: (typeof options === 'function' ? options({}) : options) as Record<string, unknown>,
        });
        return null;
      },
    }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@/components/ui/GlassTabBar', () => ({
  __esModule: true,
  default: () => null,
  useGlassTabBarInset: () => 0,
}));

jest.mock('@/screens/FeedScreen', () => () => null);
jest.mock('@/screens/ShelfScreen', () => () => null);
jest.mock('@/components/layout/UtilityMenuLauncher', () => () => null);
jest.mock('@/components/shelf/ShelfAddBookButton', () => () => null);

beforeEach(() => {
  capturedScreens.length = 0;
});

describe('MainTabNavigator — header right gutter', () => {
  it('applies an 8pt right gutter to the Timeline screen header', () => {
    render(
      <ThemeProvider>
        <MainTabNavigator />
      </ThemeProvider>,
    );
    const timeline = capturedScreens.find((s) => s.name === 'Timeline');
    expect(timeline).toBeDefined();
    expect(timeline?.options).toEqual(
      expect.objectContaining({
        headerRightContainerStyle: { paddingRight: 8 },
      }),
    );
  });

  it('applies an 8pt right gutter to the Shelf screen header', () => {
    render(
      <ThemeProvider>
        <MainTabNavigator />
      </ThemeProvider>,
    );
    const shelf = capturedScreens.find((s) => s.name === 'Shelf');
    expect(shelf).toBeDefined();
    expect(shelf?.options).toEqual(
      expect.objectContaining({
        headerRightContainerStyle: { paddingRight: 8 },
      }),
    );
  });
});
