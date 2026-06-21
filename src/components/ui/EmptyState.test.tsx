import React from 'react';
import { Text } from 'react-native';
import { screen } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders the message', () => {
    render(<EmptyState message="Nothing here yet" />);
    expect(screen.getByText('Nothing here yet')).toBeTruthy();
  });

  it('renders a title when one is provided', () => {
    render(<EmptyState title="No books" message="Add your first book" />);
    expect(screen.getByText('No books')).toBeTruthy();
  });

  it('omits the title when none is provided', () => {
    render(<EmptyState message="only a message" />);
    expect(screen.queryByText('No books')).toBeNull();
  });

  it('renders the action node when provided', () => {
    render(<EmptyState message="m" action={<Text>Do the next thing</Text>} />);
    expect(screen.getByText('Do the next thing')).toBeTruthy();
  });

  it('omits the action area when no action is given', () => {
    render(<EmptyState message="m" testID="empty" />);
    expect(screen.queryByText('Do the next thing')).toBeNull();
  });

  it('exposes the testID on the container', () => {
    render(<EmptyState message="m" testID="empty-state" />);
    expect(screen.getByTestId('empty-state')).toBeTruthy();
  });
});
