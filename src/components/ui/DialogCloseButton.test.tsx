import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import DialogCloseButton from './DialogCloseButton';

describe('DialogCloseButton', () => {
  it('renders the provided label', () => {
    render(
      <DialogCloseButton
        testID="close-btn"
        label="Close"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByText('Close')).toBeTruthy();
  });

  it('renders with the provided testID', () => {
    render(
      <DialogCloseButton
        testID="close-btn"
        label="Close"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByTestId('close-btn')).toBeTruthy();
  });

  it('exposes accessibilityRole="button"', () => {
    render(
      <DialogCloseButton
        testID="close-btn"
        label="Close"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByTestId('close-btn').props.accessibilityRole).toBe('button');
  });

  it('exposes the label as the accessibility label by default', () => {
    render(
      <DialogCloseButton
        testID="close-btn"
        label="Close"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByTestId('close-btn').props.accessibilityLabel).toBe('Close');
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(
      <DialogCloseButton
        testID="close-btn"
        label="Close"
        onPress={onPress}
      />,
    );
    fireEvent.press(screen.getByTestId('close-btn'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies unified padding (vertical: 14, horizontal: 24)', () => {
    render(
      <DialogCloseButton
        testID="close-btn"
        label="Close"
        onPress={jest.fn()}
      />,
    );
    const raw = screen.getByTestId('close-btn').props.style;
    const flat = (Array.isArray(raw) ? raw : [raw]).filter(Boolean);
    const merged = Object.assign({}, ...flat);
    expect(merged).toEqual(
      expect.objectContaining({ paddingVertical: 14, paddingHorizontal: 24 }),
    );
  });

  it('merges caller-passed style on top of the base style', () => {
    render(
      <DialogCloseButton
        testID="close-btn"
        label="Close"
        onPress={jest.fn()}
        style={{ marginTop: 99, alignSelf: 'stretch' }}
      />,
    );
    const raw = screen.getByTestId('close-btn').props.style;
    const flat = (Array.isArray(raw) ? raw : [raw]).filter(Boolean);
    const merged = Object.assign({}, ...flat);
    expect(merged).toEqual(
      expect.objectContaining({
        paddingVertical: 14,
        paddingHorizontal: 24,
        marginTop: 99,
        alignSelf: 'stretch',
      }),
    );
  });
});
