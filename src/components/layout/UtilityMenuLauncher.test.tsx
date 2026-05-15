import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import UtilityMenuLauncher from './UtilityMenuLauncher';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/lib/i18n', () => ({
  setLanguage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/notifications/registerPushToken', () => ({
  registerPushTokenIfPermitted: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user1' }, loading: false }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('UtilityMenuLauncher — entry button', () => {
  it('renders the menu icon button', () => {
    render(<UtilityMenuLauncher />);
    expect(screen.getByTestId('utility-menu-button')).toBeTruthy();
  });

  it('exposes an accessible label on the menu button', () => {
    render(<UtilityMenuLauncher />);
    const button = screen.getByTestId('utility-menu-button');
    expect(button.props.accessibilityLabel).toBe('menu.openMenu');
  });

  it('does not render the panel rows before the menu is pressed', () => {
    render(<UtilityMenuLauncher />);
    expect(screen.queryByTestId('utility-menu-row-edit-profile')).toBeNull();
    expect(screen.queryByTestId('utility-menu-row-add-friend')).toBeNull();
    expect(screen.queryByTestId('utility-menu-row-appearance')).toBeNull();
  });
});

describe('UtilityMenuLauncher — opening the panel', () => {
  it('renders all three rows after the menu button is pressed', () => {
    render(<UtilityMenuLauncher />);
    fireEvent.press(screen.getByTestId('utility-menu-button'));
    expect(screen.getByTestId('utility-menu-row-edit-profile')).toBeTruthy();
    expect(screen.getByTestId('utility-menu-row-add-friend')).toBeTruthy();
    expect(screen.getByTestId('utility-menu-row-appearance')).toBeTruthy();
  });

  it('renders localized labels on each row', () => {
    render(<UtilityMenuLauncher />);
    fireEvent.press(screen.getByTestId('utility-menu-button'));
    expect(screen.getByText('menu.editProfile')).toBeTruthy();
    expect(screen.getByText('menu.addFriend')).toBeTruthy();
    expect(screen.getByText('menu.appearanceLanguage')).toBeTruthy();
  });
});

describe('UtilityMenuLauncher — row actions', () => {
  it('navigates to EditProfile and closes the panel when edit profile row is pressed', () => {
    render(<UtilityMenuLauncher />);
    fireEvent.press(screen.getByTestId('utility-menu-button'));
    fireEvent.press(screen.getByTestId('utility-menu-row-edit-profile'));
    expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
    expect(screen.queryByTestId('utility-menu-row-edit-profile')).toBeNull();
  });

  it('navigates to AddFriend and closes the panel when add friend row is pressed', () => {
    render(<UtilityMenuLauncher />);
    fireEvent.press(screen.getByTestId('utility-menu-button'));
    fireEvent.press(screen.getByTestId('utility-menu-row-add-friend'));
    expect(mockNavigate).toHaveBeenCalledWith('AddFriend');
    expect(screen.queryByTestId('utility-menu-row-add-friend')).toBeNull();
  });

  it('opens the appearance/language dialog when the appearance row is pressed', () => {
    render(<UtilityMenuLauncher />);
    fireEvent.press(screen.getByTestId('utility-menu-button'));
    fireEvent.press(screen.getByTestId('utility-menu-row-appearance'));
    expect(screen.getByText('settings.languageTitle')).toBeTruthy();
    expect(screen.getByText('settings.themeTitle')).toBeTruthy();
  });

  it('closes the panel after the appearance row is pressed', () => {
    render(<UtilityMenuLauncher />);
    fireEvent.press(screen.getByTestId('utility-menu-button'));
    fireEvent.press(screen.getByTestId('utility-menu-row-appearance'));
    expect(screen.queryByTestId('utility-menu-row-appearance')).toBeNull();
  });

  it('does not navigate when only the menu is opened', () => {
    render(<UtilityMenuLauncher />);
    fireEvent.press(screen.getByTestId('utility-menu-button'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe('UtilityMenuLauncher — closing the panel', () => {
  it('closes the panel when the close button is pressed', () => {
    render(<UtilityMenuLauncher />);
    fireEvent.press(screen.getByTestId('utility-menu-button'));
    fireEvent.press(screen.getByTestId('utility-panel-close'));
    expect(screen.queryByTestId('utility-menu-row-edit-profile')).toBeNull();
  });

  it('closes the panel when the backdrop is pressed', () => {
    render(<UtilityMenuLauncher />);
    fireEvent.press(screen.getByTestId('utility-menu-button'));
    fireEvent.press(screen.getByTestId('utility-panel-backdrop'));
    expect(screen.queryByTestId('utility-menu-row-edit-profile')).toBeNull();
  });
});
