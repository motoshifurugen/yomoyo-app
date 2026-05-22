import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import MainTabNavigator from './MainTabNavigator';

type CapturedScreen = {
  name: string;
  options: Record<string, unknown>;
};

const capturedScreens: CapturedScreen[] = [];
let capturedScreenOptions: Record<string, unknown> | null = null;

jest.mock('@react-navigation/bottom-tabs', () => {
  const actual = jest.requireActual('@react-navigation/bottom-tabs');
  const React = require('react');
  const { View } = require('react-native');
  return {
    ...actual,
    createBottomTabNavigator: () => ({
      Navigator: ({
        children,
        screenOptions,
      }: {
        children: React.ReactNode;
        screenOptions?: unknown;
      }) => {
        capturedScreenOptions = (typeof screenOptions === 'function'
          ? screenOptions({})
          : screenOptions) as Record<string, unknown> | null;
        return React.createElement(View, null, children);
      },
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
jest.mock('@/components/feed/AddFriendButton', () => () => null);
jest.mock('@/components/settings/SettingsLauncher', () => () => null);
jest.mock('@/components/feed/BookmarkFilterToggle', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () =>
      React.createElement(View, { testID: 'bookmark-filter-toggle-mock' }),
  };
});

beforeEach(() => {
  capturedScreens.length = 0;
  capturedScreenOptions = null;
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

  it('does not configure a header right gutter for the Shelf screen', () => {
    render(
      <ThemeProvider>
        <MainTabNavigator />
      </ThemeProvider>,
    );
    const shelf = capturedScreens.find((s) => s.name === 'Shelf');
    expect(shelf).toBeDefined();
    expect(shelf?.options).not.toHaveProperty('headerRightContainerStyle');
    expect(shelf?.options).not.toHaveProperty('headerRight');
  });
});

describe('MainTabNavigator — Timeline bookmark filter entry (headerLeft)', () => {
  it('places the bookmark filter toggle in the Timeline headerLeft slot', () => {
    const { render: rtlRender } = require('@testing-library/react-native');
    render(
      <ThemeProvider>
        <MainTabNavigator />
      </ThemeProvider>,
    );
    const timeline = capturedScreens.find((s) => s.name === 'Timeline');
    expect(timeline).toBeDefined();
    const headerLeft = (timeline?.options as Record<string, unknown>).headerLeft as
      | ((props?: unknown) => React.ReactElement)
      | undefined;
    expect(typeof headerLeft).toBe('function');
    const tree = rtlRender(<ThemeProvider>{headerLeft!({})}</ThemeProvider>);
    expect(tree.getByTestId('bookmark-filter-toggle-mock')).toBeTruthy();
    tree.unmount();
  });

  it('applies an 8pt left gutter to the Timeline screen header', () => {
    render(
      <ThemeProvider>
        <MainTabNavigator />
      </ThemeProvider>,
    );
    const timeline = capturedScreens.find((s) => s.name === 'Timeline');
    expect(timeline?.options).toEqual(
      expect.objectContaining({
        headerLeftContainerStyle: { paddingLeft: 8 },
      }),
    );
  });

  it('does not place a headerLeft on the Shelf screen', () => {
    render(
      <ThemeProvider>
        <MainTabNavigator />
      </ThemeProvider>,
    );
    const shelf = capturedScreens.find((s) => s.name === 'Shelf');
    expect(shelf?.options).not.toHaveProperty('headerLeft');
    expect(shelf?.options).not.toHaveProperty('headerLeftContainerStyle');
  });
});

describe('MainTabNavigator — header title suppression', () => {
  it('configures screenOptions with a headerTitle that renders null', () => {
    render(
      <ThemeProvider>
        <MainTabNavigator />
      </ThemeProvider>,
    );
    expect(capturedScreenOptions).not.toBeNull();
    const headerTitle = (capturedScreenOptions as Record<string, unknown>).headerTitle;
    expect(typeof headerTitle).toBe('function');
    expect((headerTitle as (props?: unknown) => unknown)({})).toBeNull();
  });
});
