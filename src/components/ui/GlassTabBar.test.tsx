import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GlassTabBar from './GlassTabBar';

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: View };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 34, top: 0, left: 0, right: 0 }),
}));

const mockDispatch = jest.fn();
const mockEmit = jest.fn().mockReturnValue({ defaultPrevented: false });

const mockProps = {
  state: {
    routes: [
      { key: 'Timeline-key', name: 'Timeline' },
      { key: 'Shelf-key', name: 'Shelf' },
      { key: 'Settings-key', name: 'Settings' },
    ],
    index: 0,
  },
  descriptors: {
    'Timeline-key': { options: { title: 'Timeline' } },
    'Shelf-key': { options: { title: 'Shelf' } },
    'Settings-key': { options: { title: 'Settings' } },
  },
  navigation: {
    emit: mockEmit,
    dispatch: mockDispatch,
  },
  insets: { bottom: 34, top: 0, left: 0, right: 0 },
};

describe('GlassTabBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEmit.mockReturnValue({ defaultPrevented: false });
  });

  it('renders all tab labels', () => {
    render(<GlassTabBar {...(mockProps as any)} />);
    expect(screen.getByText('Timeline')).toBeTruthy();
    expect(screen.getByText('Shelf')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('dispatches navigation when an inactive tab is pressed', () => {
    render(<GlassTabBar {...(mockProps as any)} />);
    fireEvent.press(screen.getByText('Shelf'));
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('does not dispatch navigation when the active tab is pressed', () => {
    render(<GlassTabBar {...(mockProps as any)} />);
    fireEvent.press(screen.getByText('Timeline'));
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('marks the active tab as selected', () => {
    render(<GlassTabBar {...(mockProps as any)} />);
    const feedTab = screen.getByRole('tab', { name: 'Timeline' });
    expect(feedTab.props.accessibilityState.selected).toBe(true);
  });

  it('marks inactive tabs as not selected', () => {
    render(<GlassTabBar {...(mockProps as any)} />);
    const shelfTab = screen.getByRole('tab', { name: 'Shelf' });
    expect(shelfTab.props.accessibilityState.selected).toBe(false);
  });

  it('renders without crashing for an unknown route name', () => {
    const propsWithUnknownRoute = {
      ...mockProps,
      state: {
        routes: [{ key: 'Unknown-key', name: 'Unknown' }],
        index: 0,
      },
      descriptors: {
        'Unknown-key': { options: { title: 'Unknown' } },
      },
    };
    expect(() => render(<GlassTabBar {...(propsWithUnknownRoute as any)} />)).not.toThrow();
    expect(screen.getByText('Unknown')).toBeTruthy();
  });
});
