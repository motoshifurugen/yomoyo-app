import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsButton from './SettingsButton';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('SettingsButton', () => {
  it('renders with the correct testID', () => {
    render(<SettingsButton onPress={jest.fn()} />);
    expect(screen.getByTestId('settings-button')).toBeTruthy();
  });

  it('exposes an accessible label', () => {
    render(<SettingsButton onPress={jest.fn()} />);
    const button = screen.getByTestId('settings-button');
    expect(button.props.accessibilityLabel).toBe('settings.openSettings');
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<SettingsButton onPress={onPress} />);
    fireEvent.press(screen.getByTestId('settings-button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
