import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import GlassCard from './GlassCard';

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: View };
});

describe('GlassCard', () => {
  it('renders children', () => {
    render(
      <GlassCard>
        <Text>Card content</Text>
      </GlassCard>
    );
    expect(screen.getByText('Card content')).toBeTruthy();
  });
});
