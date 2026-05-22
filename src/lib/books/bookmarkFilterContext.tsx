import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type BookmarkFilterMode = 'all' | 'bookmarks';

type BookmarkFilterContextValue = {
  mode: BookmarkFilterMode;
  setMode: (mode: BookmarkFilterMode) => void;
  toggle: () => void;
};

const BookmarkFilterContext = createContext<BookmarkFilterContextValue | null>(null);

type ProviderProps = {
  children: React.ReactNode;
  initialMode?: BookmarkFilterMode;
};

export function BookmarkFilterProvider({ children, initialMode = 'all' }: ProviderProps) {
  const [mode, setMode] = useState<BookmarkFilterMode>(initialMode);

  const toggle = useCallback(() => {
    setMode((prev) => (prev === 'all' ? 'bookmarks' : 'all'));
  }, []);

  const value = useMemo<BookmarkFilterContextValue>(
    () => ({ mode, setMode, toggle }),
    [mode, toggle],
  );

  return (
    <BookmarkFilterContext.Provider value={value}>{children}</BookmarkFilterContext.Provider>
  );
}

export function useBookmarkFilter(): BookmarkFilterContextValue {
  const ctx = useContext(BookmarkFilterContext);
  if (!ctx) {
    throw new Error('useBookmarkFilter must be used inside a BookmarkFilterProvider');
  }
  return ctx;
}
