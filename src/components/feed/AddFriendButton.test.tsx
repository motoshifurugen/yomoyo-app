import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import AddFriendButton from './AddFriendButton';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AddFriendButton — icon variant (default)', () => {
  it('renders with the correct testID', () => {
    render(<AddFriendButton />);
    expect(screen.getByTestId('add-friend-button-icon')).toBeTruthy();
  });

  it('exposes an accessible label', () => {
    render(<AddFriendButton />);
    const button = screen.getByTestId('add-friend-button-icon');
    expect(button.props.accessibilityLabel).toBe('addFriend.heading');
  });

  it("navigates to AddFriend when pressed", () => {
    render(<AddFriendButton />);
    fireEvent.press(screen.getByTestId('add-friend-button-icon'));
    expect(mockNavigate).toHaveBeenCalledWith('AddFriend');
  });
});

describe('AddFriendButton — inline variant', () => {
  it('renders with the inline testID and a visible label', () => {
    render(<AddFriendButton variant="inline" />);
    expect(screen.getByTestId('add-friend-button-inline')).toBeTruthy();
    expect(screen.getByText('addFriend.heading')).toBeTruthy();
  });

  it("navigates to AddFriend when pressed", () => {
    render(<AddFriendButton variant="inline" />);
    fireEvent.press(screen.getByTestId('add-friend-button-inline'));
    expect(mockNavigate).toHaveBeenCalledWith('AddFriend');
  });
});
