import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react-native';
import { renderWithTheme } from '@/lib/theme/testUtils';
import { BookmarkFilterProvider, useBookmarkFilter } from '@/lib/books/bookmarkFilterContext';
import BookmarkFilterToggle from './BookmarkFilterToggle';
import { Text } from 'react-native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function ModeProbe() {
  const { mode } = useBookmarkFilter();
  return <Text testID="mode-readout">{mode}</Text>;
}

function renderWithProvider(ui: React.ReactElement) {
  return renderWithTheme(<BookmarkFilterProvider>{ui}</BookmarkFilterProvider>);
}

describe('BookmarkFilterToggle', () => {
  it('renders with selected=false while mode is "all"', () => {
    renderWithProvider(<BookmarkFilterToggle />);
    expect(screen.getByTestId('bookmark-filter-toggle').props.accessibilityState?.selected).toBe(
      false,
    );
  });

  it('uses the filterBookmarks label when mode is "all"', () => {
    renderWithProvider(<BookmarkFilterToggle />);
    expect(screen.getByTestId('bookmark-filter-toggle').props.accessibilityLabel).toBe(
      'timeline.filterBookmarks',
    );
  });

  it('shows a visible bookmark label so the filter is self-explanatory', () => {
    renderWithProvider(<BookmarkFilterToggle />);
    expect(screen.getByText('timeline.filterLabel')).toBeTruthy();
  });

  it('applies an active pill background only when bookmarks-only is selected', () => {
    const flatten = (style: unknown) =>
      Object.assign({}, ...(Array.isArray(style) ? style : [style]).filter(Boolean));
    renderWithProvider(
      <>
        <ModeProbe />
        <BookmarkFilterToggle />
      </>,
    );
    const before = flatten(screen.getByTestId('bookmark-filter-toggle').props.style);
    expect(before.backgroundColor).toBeUndefined();
    act(() => {
      fireEvent.press(screen.getByTestId('bookmark-filter-toggle'));
    });
    const after = flatten(screen.getByTestId('bookmark-filter-toggle').props.style);
    expect(after.backgroundColor).toBeDefined();
  });

  it('flips the filter mode when pressed', () => {
    renderWithProvider(
      <>
        <ModeProbe />
        <BookmarkFilterToggle />
      </>,
    );
    expect(screen.getByTestId('mode-readout').props.children).toBe('all');
    act(() => {
      fireEvent.press(screen.getByTestId('bookmark-filter-toggle'));
    });
    expect(screen.getByTestId('mode-readout').props.children).toBe('bookmarks');
    expect(screen.getByTestId('bookmark-filter-toggle').props.accessibilityState?.selected).toBe(
      true,
    );
    expect(screen.getByTestId('bookmark-filter-toggle').props.accessibilityLabel).toBe(
      'timeline.filterAll',
    );
  });
});
