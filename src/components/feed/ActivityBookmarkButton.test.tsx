import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import ActivityBookmarkButton from './ActivityBookmarkButton';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ActivityBookmarkButton', () => {
  it('renders with the off (outline) icon when bookmarked=false', () => {
    render(<ActivityBookmarkButton activityId="act1" bookmarked={false} onToggle={() => {}} />);
    const button = screen.getByTestId('bookmark-toggle-act1');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityState?.selected).toBe(false);
  });

  it('renders the on (filled) state when bookmarked=true', () => {
    render(<ActivityBookmarkButton activityId="act1" bookmarked={true} onToggle={() => {}} />);
    const button = screen.getByTestId('bookmark-toggle-act1');
    expect(button.props.accessibilityState?.selected).toBe(true);
  });

  it('uses the add label when not bookmarked', () => {
    render(<ActivityBookmarkButton activityId="act1" bookmarked={false} onToggle={() => {}} />);
    expect(screen.getByTestId('bookmark-toggle-act1').props.accessibilityLabel).toBe(
      'timeline.bookmarkAdd',
    );
  });

  it('uses the remove label when bookmarked', () => {
    render(<ActivityBookmarkButton activityId="act1" bookmarked={true} onToggle={() => {}} />);
    expect(screen.getByTestId('bookmark-toggle-act1').props.accessibilityLabel).toBe(
      'timeline.bookmarkRemove',
    );
  });

  it('calls onToggle with the activity id when pressed', () => {
    const onToggle = jest.fn();
    render(<ActivityBookmarkButton activityId="act1" bookmarked={false} onToggle={onToggle} />);
    act(() => {
      fireEvent.press(screen.getByTestId('bookmark-toggle-act1'));
    });
    expect(onToggle).toHaveBeenCalledWith('act1');
  });

  it('exposes button accessibility role for screen readers', () => {
    render(<ActivityBookmarkButton activityId="act1" bookmarked={false} onToggle={() => {}} />);
    const button = screen.getByTestId('bookmark-toggle-act1');
    expect(button.props.accessibilityRole).toBe('button');
  });
});
