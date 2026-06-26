import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { screen } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import Skeleton from './Skeleton';

// The block is intentionally hidden from the accessibility tree, so queries
// must opt into hidden elements to reach it.
const HIDDEN = { includeHiddenElements: true } as const;

describe('Skeleton', () => {
  it('renders a block with the given testID', () => {
    render(<Skeleton testID="sk" />);
    expect(screen.getByTestId('sk', HIDDEN)).toBeTruthy();
  });

  it('applies the provided width, height and borderRadius', () => {
    render(<Skeleton testID="sk" width={120} height={20} borderRadius={4} />);
    const node = screen.getByTestId('sk', HIDDEN);
    expect(node.props.style).toEqual(
      expect.objectContaining({ width: 120, height: 20, borderRadius: 4 }),
    );
  });

  it('is hidden from assistive technologies (decorative)', () => {
    render(<Skeleton testID="sk" />);
    const node = screen.getByTestId('sk', HIDDEN);
    expect(node.props.accessibilityElementsHidden).toBe(true);
    expect(node.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('checks the reduce-motion setting before animating', () => {
    const spy = jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);
    render(<Skeleton testID="sk" />);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
