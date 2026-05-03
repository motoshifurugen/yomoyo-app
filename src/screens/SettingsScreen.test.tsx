import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SettingsScreen from './SettingsScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('SettingsScreen', () => {
  it('renders without crashing', () => {
    render(<SettingsScreen />);
  });

  it('renders the settings title key', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('tabs.settings')).toBeTruthy();
  });
});
