import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import ActivityDetailModal from './ActivityDetailModal';
import type { ReadingActivity } from '@/lib/books/readingActivity';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/lib/users/avatarIdentity', () => ({
  ANIMAL_ASSETS: { fox: 1, bear: 2 },
}));

const baseActivity: ReadingActivity = {
  id: 'act1',
  userId: 'user2',
  bookId: 'book1',
  title: 'Dune',
  authors: ['Frank Herbert', 'Brian Herbert'],
  thumbnail: 'https://example.com/dune.jpg',
  status: 'finished',
  finishedAt: null,
  displayName: 'Bold Bear',
  displayAvatar: 'bear',
};

describe('ActivityDetailModal', () => {
  it('renders nothing when activity is null', () => {
    const onClose = jest.fn();
    const onViewProfile = jest.fn();
    render(
      <ActivityDetailModal
        activity={null}
        visible={false}
        onClose={onClose}
        onViewProfile={onViewProfile}
      />,
    );
    expect(screen.queryByTestId('activity-detail-modal')).toBeNull();
  });

  it('renders the book title and authors when visible', () => {
    render(
      <ActivityDetailModal
        activity={baseActivity}
        visible={true}
        onClose={jest.fn()}
        onViewProfile={jest.fn()}
      />,
    );
    expect(screen.getByText('Dune')).toBeTruthy();
    expect(screen.getByText('Frank Herbert, Brian Herbert')).toBeTruthy();
  });

  it("renders the friend's display name", () => {
    render(
      <ActivityDetailModal
        activity={baseActivity}
        visible={true}
        onClose={jest.fn()}
        onViewProfile={jest.fn()}
      />,
    );
    expect(screen.getByText('Bold Bear')).toBeTruthy();
  });

  it('falls back to legacy displayLabel when displayName is absent', () => {
    const legacy = { ...baseActivity, displayName: undefined, displayLabel: 'Legacy Bear' };
    render(
      <ActivityDetailModal
        activity={legacy as ReadingActivity}
        visible={true}
        onClose={jest.fn()}
        onViewProfile={jest.fn()}
      />,
    );
    expect(screen.getByText('Legacy Bear')).toBeTruthy();
  });

  it('renders the finished-reading sub-label', () => {
    render(
      <ActivityDetailModal
        activity={baseActivity}
        visible={true}
        onClose={jest.fn()}
        onViewProfile={jest.fn()}
      />,
    );
    expect(screen.getByText('timeline.finishedReading')).toBeTruthy();
  });

  it('falls back to a placeholder when thumbnail is missing', () => {
    const noThumb = { ...baseActivity, thumbnail: null };
    render(
      <ActivityDetailModal
        activity={noThumb}
        visible={true}
        onClose={jest.fn()}
        onViewProfile={jest.fn()}
      />,
    );
    expect(screen.queryByTestId('modal-book-thumbnail')).toBeNull();
    expect(screen.getByTestId('modal-book-thumbnail-placeholder')).toBeTruthy();
  });

  it('calls onClose when the close button is pressed', () => {
    const onClose = jest.fn();
    render(
      <ActivityDetailModal
        activity={baseActivity}
        visible={true}
        onClose={onClose}
        onViewProfile={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByTestId('modal-close-button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onViewProfile with the friend's uid when View profile is pressed", () => {
    const onViewProfile = jest.fn();
    render(
      <ActivityDetailModal
        activity={baseActivity}
        visible={true}
        onClose={jest.fn()}
        onViewProfile={onViewProfile}
      />,
    );
    fireEvent.press(screen.getByTestId('modal-view-profile-button'));
    expect(onViewProfile).toHaveBeenCalledWith('user2');
  });

  it('handles activities with no authors gracefully', () => {
    const noAuthors = { ...baseActivity, authors: [] };
    render(
      <ActivityDetailModal
        activity={noAuthors}
        visible={true}
        onClose={jest.fn()}
        onViewProfile={jest.fn()}
      />,
    );
    expect(screen.getByText('bookDetail.unknownAuthor')).toBeTruthy();
  });
});
