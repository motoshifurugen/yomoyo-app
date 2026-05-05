import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AddFriendScreen from './AddFriendScreen';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AddFriendScreen', () => {
  it('renders the heading', () => {
    render(<AddFriendScreen />);
    expect(screen.getByText('addFriend.heading')).toBeTruthy();
  });

  it('renders the coming-soon body', () => {
    render(<AddFriendScreen />);
    expect(screen.getByText('addFriend.comingSoonBody')).toBeTruthy();
  });

  it('renders a close button', () => {
    render(<AddFriendScreen />);
    expect(screen.getByTestId('add-friend-close-button')).toBeTruthy();
  });

  it('calls navigation.goBack when the close button is pressed', () => {
    render(<AddFriendScreen />);
    fireEvent.press(screen.getByTestId('add-friend-close-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
