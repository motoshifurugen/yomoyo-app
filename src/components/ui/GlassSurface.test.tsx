import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import GlassSurface from './GlassSurface';

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: View };
});

describe('GlassSurface', () => {
  it('renders children', () => {
    render(
      <GlassSurface>
        <Text>Glass content</Text>
      </GlassSurface>
    );
    expect(screen.getByText('Glass content')).toBeTruthy();
  });

  it('renders with a custom border radius without crashing', () => {
    render(
      <GlassSurface borderRadius={30}>
        <Text>Pill shape</Text>
      </GlassSurface>
    );
    expect(screen.getByText('Pill shape')).toBeTruthy();
  });

  it('uses the translucent fallback when native blur is unavailable', () => {
    // In the test environment, NativeModules.ExpoBlurViewManager is undefined,
    // so the blur-unavailable path should be taken.
    render(
      <GlassSurface>
        <Text>fallback</Text>
      </GlassSurface>
    );
    expect(screen.getByTestId('glass-surface-fallback')).toBeTruthy();
  });

  it('renders children in the fallback view', () => {
    render(
      <GlassSurface>
        <Text>inside fallback</Text>
      </GlassSurface>
    );
    expect(screen.getByText('inside fallback')).toBeTruthy();
    expect(screen.getByTestId('glass-surface-fallback')).toBeTruthy();
  });
});
