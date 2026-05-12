import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import HeaderIconButton from './HeaderIconButton';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('HeaderIconButton', () => {
  it('renders with the provided testID', () => {
    render(
      <HeaderIconButton
        testID="custom-testid"
        iconName="settings-outline"
        accessibilityLabel="Open settings"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByTestId('custom-testid')).toBeTruthy();
  });

  it('exposes the provided accessibility label', () => {
    render(
      <HeaderIconButton
        testID="custom-testid"
        iconName="settings-outline"
        accessibilityLabel="Open settings"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByTestId('custom-testid').props.accessibilityLabel).toBe('Open settings');
  });

  it('exposes accessibilityRole="button"', () => {
    render(
      <HeaderIconButton
        testID="custom-testid"
        iconName="settings-outline"
        accessibilityLabel="Open settings"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByTestId('custom-testid').props.accessibilityRole).toBe('button');
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(
      <HeaderIconButton
        testID="custom-testid"
        iconName="settings-outline"
        accessibilityLabel="Open settings"
        onPress={onPress}
      />,
    );
    fireEvent.press(screen.getByTestId('custom-testid'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies a unified hitSlop of 8', () => {
    render(
      <HeaderIconButton
        testID="custom-testid"
        iconName="settings-outline"
        accessibilityLabel="Open settings"
        onPress={jest.fn()}
      />,
    );
    expect(screen.getByTestId('custom-testid').props.hitSlop).toBe(8);
  });

  it('applies unified padding (horizontal: 12, vertical: 8)', () => {
    render(
      <HeaderIconButton
        testID="custom-testid"
        iconName="settings-outline"
        accessibilityLabel="Open settings"
        onPress={jest.fn()}
      />,
    );
    const style = screen.getByTestId('custom-testid').props.style;
    expect(style).toEqual(expect.objectContaining({ paddingHorizontal: 12, paddingVertical: 8 }));
  });
});
