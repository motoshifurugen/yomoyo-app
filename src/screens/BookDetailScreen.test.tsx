import React from 'react';
import { render, screen } from '@testing-library/react-native';
import BookDetailScreen from './BookDetailScreen';

describe('BookDetailScreen', () => {
  it('renders without crashing', () => {
    render(<BookDetailScreen />);
  });

  it('renders the Book Detail title', () => {
    render(<BookDetailScreen />);
    expect(screen.getByText('Book Detail')).toBeTruthy();
  });
});
