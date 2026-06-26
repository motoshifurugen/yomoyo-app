import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import FeedSkeleton from './FeedSkeleton';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

describe('FeedSkeleton', () => {
  it('renders the default number of placeholder cards', () => {
    render(<FeedSkeleton />);
    expect(screen.getAllByTestId('feed-skeleton-card')).toHaveLength(5);
  });

  it('renders a custom number of placeholder cards', () => {
    render(<FeedSkeleton count={2} />);
    expect(screen.getAllByTestId('feed-skeleton-card')).toHaveLength(2);
  });

  it('exposes a single loading label to assistive technologies', () => {
    render(<FeedSkeleton />);
    const group = screen.getByTestId('feed-skeleton');
    expect(group.props.accessibilityLabel).toBe('common.loading');
    expect(group.props.accessibilityState).toEqual({ busy: true });
  });
});
