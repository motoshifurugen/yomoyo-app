import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import AdErrorBoundary from './AdErrorBoundary';

const Thrower = () => {
  throw new Error('boom');
};

describe('AdErrorBoundary', () => {
  it('renders its children when no error is thrown', () => {
    render(
      <AdErrorBoundary>
        <Text>safe child</Text>
      </AdErrorBoundary>,
    );
    expect(screen.getByText('safe child')).toBeTruthy();
  });

  it('renders nothing when a descendant throws during render', () => {
    render(
      <AdErrorBoundary>
        <Thrower />
      </AdErrorBoundary>,
    );
    expect(screen.queryByText('safe child')).toBeNull();
  });
});
