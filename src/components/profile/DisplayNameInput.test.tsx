import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import DisplayNameInput from './DisplayNameInput';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('DisplayNameInput', () => {
  it('renders the input field with current value', () => {
    render(<DisplayNameInput value="Foxy" onChangeText={() => {}} />);
    const input = screen.getByTestId('display-name-input');
    expect(input.props.value).toBe('Foxy');
  });

  it('calls onChangeText when text changes', () => {
    const onChange = jest.fn();
    render(<DisplayNameInput value="" onChangeText={onChange} />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'hello');
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('renders no error text when error is undefined', () => {
    render(<DisplayNameInput value="ok" onChangeText={() => {}} />);
    expect(screen.queryByTestId('display-name-error')).toBeNull();
  });

  it('renders the empty error key when error is "empty"', () => {
    render(<DisplayNameInput value="" onChangeText={() => {}} error="empty" />);
    expect(screen.getByTestId('display-name-error')).toBeTruthy();
    expect(screen.getByText('profile.displayName.errors.empty')).toBeTruthy();
  });

  it('renders the too_long error key when error is "too_long"', () => {
    render(<DisplayNameInput value="x" onChangeText={() => {}} error="too_long" />);
    expect(screen.getByText('profile.displayName.errors.tooLong')).toBeTruthy();
  });

  it('renders the has_newline error key when error is "has_newline"', () => {
    render(<DisplayNameInput value="x" onChangeText={() => {}} error="has_newline" />);
    expect(screen.getByText('profile.displayName.errors.newline')).toBeTruthy();
  });

  it('disables multiline input', () => {
    render(<DisplayNameInput value="x" onChangeText={() => {}} />);
    const input = screen.getByTestId('display-name-input');
    expect(input.props.multiline).toBe(false);
  });

  it('marks the error text as a polite live region for screen readers', () => {
    render(<DisplayNameInput value="" onChangeText={() => {}} error="empty" />);
    const errorText = screen.getByTestId('display-name-error');
    expect(errorText.props.accessibilityLiveRegion).toBe('polite');
  });
});
