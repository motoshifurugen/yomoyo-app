import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import BookListItem from './BookListItem';

describe('BookListItem', () => {
  it('renders the title and joined authors', () => {
    render(<BookListItem title="The Great Gatsby" authors={['F. Scott Fitzgerald', 'Ed.']} />);
    expect(screen.getByText('The Great Gatsby')).toBeTruthy();
    expect(screen.getByText('F. Scott Fitzgerald, Ed.')).toBeTruthy();
  });

  it('gives the thumbnail an accessibilityLabel matching the title', () => {
    render(
      <BookListItem title="Cover Book" authors={['A']} thumbnail="https://example.com/c.jpg" />,
    );
    expect(screen.getByLabelText('Cover Book')).toBeTruthy();
  });

  it('renders a placeholder (no image) when no thumbnail is given', () => {
    render(<BookListItem title="No Cover" authors={['A']} />);
    expect(screen.queryByLabelText('No Cover')).toBeNull();
  });

  it('shows the date when provided', () => {
    render(<BookListItem title="Dated" authors={['A']} date="2026/06/21" />);
    expect(screen.getByText('2026/06/21')).toBeTruthy();
  });

  it('omits the date when none is given', () => {
    render(<BookListItem title="Undated" authors={['A']} />);
    expect(screen.queryByText('2026/06/21')).toBeNull();
  });

  it('falls back to the unknown-author label when authors is empty', () => {
    render(<BookListItem title="X" authors={[]} unknownAuthorLabel="Unknown author" />);
    expect(screen.getByText('Unknown author')).toBeTruthy();
  });

  it('is pressable and calls onPress when an onPress handler is given', () => {
    const onPress = jest.fn();
    render(<BookListItem title="Tap" authors={['A']} onPress={onPress} testID="tap-item" />);
    fireEvent.press(screen.getByTestId('tap-item'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders as non-pressable (no button role) when no onPress is given', () => {
    render(<BookListItem title="Static" authors={['A']} testID="static-item" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});
