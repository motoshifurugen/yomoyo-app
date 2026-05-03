import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import ScreenContainer from './ScreenContainer';

describe('ScreenContainer', () => {
  it('renders children', () => {
    render(
      <ScreenContainer>
        <Text>Hello</Text>
      </ScreenContainer>
    );
    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
