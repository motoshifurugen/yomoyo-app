import React from 'react';
import { Text, Pressable } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import {
  BookmarkFilterProvider,
  useBookmarkFilter,
} from './bookmarkFilterContext';

function Probe() {
  const { mode, setMode, toggle } = useBookmarkFilter();
  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Pressable testID="set-bookmarks" onPress={() => setMode('bookmarks')}>
        <Text>set</Text>
      </Pressable>
      <Pressable testID="toggle" onPress={() => toggle()}>
        <Text>toggle</Text>
      </Pressable>
    </>
  );
}

describe('BookmarkFilterProvider', () => {
  it('respects initialMode when provided (for tests / restore-state scenarios)', () => {
    render(
      <BookmarkFilterProvider initialMode="bookmarks">
        <Probe />
      </BookmarkFilterProvider>,
    );
    expect(screen.getByTestId('mode').props.children).toBe('bookmarks');
  });

  it('defaults to "all" mode on first render', () => {
    render(
      <BookmarkFilterProvider>
        <Probe />
      </BookmarkFilterProvider>,
    );
    expect(screen.getByTestId('mode').props.children).toBe('all');
  });

  it('updates the mode when setMode is called', () => {
    render(
      <BookmarkFilterProvider>
        <Probe />
      </BookmarkFilterProvider>,
    );
    act(() => {
      fireEvent.press(screen.getByTestId('set-bookmarks'));
    });
    expect(screen.getByTestId('mode').props.children).toBe('bookmarks');
  });

  it('flips the mode when toggle is called', () => {
    render(
      <BookmarkFilterProvider>
        <Probe />
      </BookmarkFilterProvider>,
    );
    act(() => fireEvent.press(screen.getByTestId('toggle')));
    expect(screen.getByTestId('mode').props.children).toBe('bookmarks');
    act(() => fireEvent.press(screen.getByTestId('toggle')));
    expect(screen.getByTestId('mode').props.children).toBe('all');
  });
});

describe('useBookmarkFilter outside provider', () => {
  it('throws a clear error when used without a provider', () => {
    // Silence React's console.error from the boundary
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/BookmarkFilterProvider/);
    spy.mockRestore();
  });
});
