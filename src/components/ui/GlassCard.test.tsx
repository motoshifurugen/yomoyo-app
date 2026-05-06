import React from 'react';
import { Text } from 'react-native';
import { screen } from '@testing-library/react-native';
import GlassCard from './GlassCard';
import { renderWithTheme } from '@/lib/theme/testUtils';

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: View };
});

describe('GlassCard', () => {
  it('renders children', () => {
    renderWithTheme(
      <GlassCard>
        <Text>Card content</Text>
      </GlassCard>
    );
    expect(screen.getByText('Card content')).toBeTruthy();
  });
});
