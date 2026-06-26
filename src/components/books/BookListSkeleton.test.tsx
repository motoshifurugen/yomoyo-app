import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import BookListSkeleton from './BookListSkeleton';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

describe('BookListSkeleton', () => {
  it('renders the default number of placeholder rows', () => {
    render(<BookListSkeleton />);
    expect(screen.getAllByTestId('book-list-skeleton-row')).toHaveLength(4);
  });

  it('renders a custom number of placeholder rows', () => {
    render(<BookListSkeleton count={3} />);
    expect(screen.getAllByTestId('book-list-skeleton-row')).toHaveLength(3);
  });

  it('exposes a single loading label to assistive technologies', () => {
    render(<BookListSkeleton />);
    const group = screen.getByTestId('book-list-skeleton');
    expect(group.props.accessibilityLabel).toBe('common.loading');
    expect(group.props.accessibilityState).toEqual({ busy: true });
  });
});
