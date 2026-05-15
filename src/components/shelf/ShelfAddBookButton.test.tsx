import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import ShelfAddBookButton from './ShelfAddBookButton';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ShelfAddBookButton', () => {
  it('renders with the correct testID', () => {
    render(<ShelfAddBookButton />);
    expect(screen.getByTestId('shelf-add-book-button')).toBeTruthy();
  });

  it('exposes the shelf add-book label for accessibility', () => {
    render(<ShelfAddBookButton />);
    const button = screen.getByTestId('shelf-add-book-button');
    expect(button.props.accessibilityLabel).toBe('shelf.addBook');
  });

  it('navigates to BookSearch when pressed', () => {
    render(<ShelfAddBookButton />);
    fireEvent.press(screen.getByTestId('shelf-add-book-button'));
    expect(mockNavigate).toHaveBeenCalledWith('BookSearch');
  });
});
