import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import EditProfileScreen from './EditProfileScreen';
import { useNavigation } from '@react-navigation/native';
import { getAvatarIdentity, saveAvatarIdentity } from '@/lib/users/avatarIdentity';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user1' }, loading: false }),
}));

jest.mock('@/lib/users/avatarIdentity', () => {
  const actual = jest.requireActual('@/lib/users/avatarIdentity');
  return {
    ...actual,
    getAvatarIdentity: jest.fn(),
    saveAvatarIdentity: jest.fn(() => Promise.resolve()),
  };
});

const mockGoBack = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useNavigation).mockReturnValue({ goBack: mockGoBack } as any);
  jest.mocked(getAvatarIdentity).mockResolvedValue({
    animalKey: 'fox',
    displayName: 'Foxy',
    finalizedAt: null,
  });
});

describe('EditProfileScreen', () => {
  it('loads existing identity into the input field', async () => {
    render(<EditProfileScreen />);
    const input = await screen.findByTestId('display-name-input');
    await waitFor(() => {
      expect(input.props.value).toBe('Foxy');
    });
  });

  it('renders the avatar grid picker', async () => {
    render(<EditProfileScreen />);
    expect(await screen.findByTestId('animal-grid-picker')).toBeTruthy();
  });

  it('saves with updated displayName and animalKey on save press', async () => {
    render(<EditProfileScreen />);
    await screen.findByTestId('display-name-input');
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Newname');
    fireEvent.press(screen.getByTestId('animal-cell-bear'));
    fireEvent.press(screen.getByTestId('edit-profile-save'));
    await waitFor(() => {
      expect(saveAvatarIdentity).toHaveBeenCalledWith('user1', {
        animalKey: 'bear',
        displayName: 'Newname',
      });
    });
  });

  it('navigates back after a successful save', async () => {
    render(<EditProfileScreen />);
    await screen.findByTestId('display-name-input');
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Newname');
    fireEvent.press(screen.getByTestId('edit-profile-save'));
    await waitFor(() => {
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('does not save when displayName is invalid', async () => {
    render(<EditProfileScreen />);
    await screen.findByTestId('display-name-input');
    fireEvent.changeText(screen.getByTestId('display-name-input'), '   ');
    fireEvent.press(screen.getByTestId('edit-profile-save'));
    expect(saveAvatarIdentity).not.toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('navigates back without saving when cancel is pressed', async () => {
    render(<EditProfileScreen />);
    await screen.findByTestId('display-name-input');
    fireEvent.press(screen.getByTestId('edit-profile-cancel'));
    expect(saveAvatarIdentity).not.toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('trims whitespace before saving', async () => {
    render(<EditProfileScreen />);
    await screen.findByTestId('display-name-input');
    fireEvent.changeText(screen.getByTestId('display-name-input'), '  Trimmed  ');
    fireEvent.press(screen.getByTestId('edit-profile-save'));
    await waitFor(() => {
      expect(saveAvatarIdentity).toHaveBeenCalledWith('user1', {
        animalKey: 'fox',
        displayName: 'Trimmed',
      });
    });
  });
});
