import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import MyIdentityHeader from './MyIdentityHeader';
import { getAvatarIdentity, ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/lib/users/avatarIdentity', () => {
  const actual = jest.requireActual('@/lib/users/avatarIdentity');
  return {
    ...actual,
    getAvatarIdentity: jest.fn(),
  };
});

const mockedGetAvatarIdentity = getAvatarIdentity as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedGetAvatarIdentity.mockResolvedValue({
    animalKey: 'fox',
    displayName: 'Foxy',
    finalizedAt: null,
  });
});

describe('MyIdentityHeader', () => {
  it('fetches the avatar identity for the given uid on mount', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await waitFor(() => expect(mockedGetAvatarIdentity).toHaveBeenCalledWith('user1'));
  });

  it('renders the display name once identity loads', async () => {
    render(<MyIdentityHeader uid="user1" />);
    expect(await screen.findByText('Foxy')).toBeTruthy();
  });

  it('renders the avatar image matching the resolved animalKey', async () => {
    render(<MyIdentityHeader uid="user1" />);
    const avatar = await screen.findByTestId('my-identity-avatar');
    expect(avatar.props.source).toBe(ANIMAL_ASSETS.fox);
  });

  it('renders the edit affordance hint', async () => {
    render(<MyIdentityHeader uid="user1" />);
    expect(await screen.findByText('shelf.editHint')).toBeTruthy();
  });

  it('navigates to EditProfile when the area is pressed', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    fireEvent.press(screen.getByTestId('my-identity-header'));
    expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
  });

  it('renders nothing when getAvatarIdentity resolves to null', async () => {
    mockedGetAvatarIdentity.mockResolvedValueOnce(null);
    render(<MyIdentityHeader uid="user1" />);
    await waitFor(() => expect(mockedGetAvatarIdentity).toHaveBeenCalled());
    expect(screen.queryByTestId('my-identity-header')).toBeNull();
    expect(screen.queryByText('shelf.editHint')).toBeNull();
  });

  it('does not navigate when pressed before identity has loaded', () => {
    mockedGetAvatarIdentity.mockReturnValueOnce(new Promise(() => {}));
    render(<MyIdentityHeader uid="user1" />);
    expect(screen.queryByTestId('my-identity-header')).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
