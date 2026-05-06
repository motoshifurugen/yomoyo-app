import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import AddFriendScreen from './AddFriendScreen';
import { findUidByHandle } from '@/lib/users/handles';
import { getAvatarIdentity } from '@/lib/users/avatarIdentity';

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack, navigate: mockNavigate }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'me-uid' }, loading: false }),
}));

jest.mock('@/lib/users/handles', () => ({
  findUidByHandle: jest.fn(),
}));

jest.mock('@/lib/users/avatarIdentity', () => ({
  getAvatarIdentity: jest.fn(),
  ANIMAL_ASSETS: { fox: 1, bear: 2 },
}));

const mockedFindUid = findUidByHandle as jest.Mock;
const mockedGetAvatar = getAvatarIdentity as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AddFriendScreen — initial render', () => {
  it('renders the heading', () => {
    render(<AddFriendScreen />);
    expect(screen.getByText('addFriend.heading')).toBeTruthy();
  });

  it('renders the handle input', () => {
    render(<AddFriendScreen />);
    expect(screen.getByPlaceholderText('addFriend.placeholder')).toBeTruthy();
  });

  it('renders the search button', () => {
    render(<AddFriendScreen />);
    expect(screen.getByText('addFriend.search')).toBeTruthy();
  });

  it('renders a close button', () => {
    render(<AddFriendScreen />);
    expect(screen.getByTestId('add-friend-close-button')).toBeTruthy();
  });

  it('calls navigation.goBack when close is pressed', () => {
    render(<AddFriendScreen />);
    fireEvent.press(screen.getByTestId('add-friend-close-button'));
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('does not show any result message before searching', () => {
    render(<AddFriendScreen />);
    expect(screen.queryByText('addFriend.notFound')).toBeNull();
    expect(screen.queryByText('addFriend.selfMatch')).toBeNull();
  });
});

describe('AddFriendScreen — search behavior', () => {
  it('shows the not-found message when no match exists', async () => {
    mockedFindUid.mockResolvedValueOnce(null);
    render(<AddFriendScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText('addFriend.placeholder'),
      'unknown1',
    );
    fireEvent.press(screen.getByText('addFriend.search'));
    await waitFor(() => {
      expect(screen.getByText('addFriend.notFound')).toBeTruthy();
    });
  });

  it('shows the self-match message when the handle resolves to the current user', async () => {
    mockedFindUid.mockResolvedValueOnce('me-uid');
    render(<AddFriendScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText('addFriend.placeholder'),
      'myself1',
    );
    fireEvent.press(screen.getByText('addFriend.search'));
    await waitFor(() => {
      expect(screen.getByText('addFriend.selfMatch')).toBeTruthy();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate or fetch the avatar on a self-match', async () => {
    mockedFindUid.mockResolvedValueOnce('me-uid');
    render(<AddFriendScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText('addFriend.placeholder'),
      'myself1',
    );
    fireEvent.press(screen.getByText('addFriend.search'));
    await waitFor(() => {
      expect(screen.getByText('addFriend.selfMatch')).toBeTruthy();
    });
    expect(mockedGetAvatar).not.toHaveBeenCalled();
  });

  it('shows the matched user display label when a different user matches', async () => {
    mockedFindUid.mockResolvedValueOnce('friend-uid');
    mockedGetAvatar.mockResolvedValueOnce({
      animalKey: 'fox',
      displayName: 'Quiet Fox',
      finalizedAt: null,
    });
    render(<AddFriendScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText('addFriend.placeholder'),
      'quietfox',
    );
    fireEvent.press(screen.getByText('addFriend.search'));
    await waitFor(() => {
      expect(screen.getByText('Quiet Fox')).toBeTruthy();
    });
  });

  it('renders a "View profile" button on a successful match', async () => {
    mockedFindUid.mockResolvedValueOnce('friend-uid');
    mockedGetAvatar.mockResolvedValueOnce({
      animalKey: 'fox',
      displayName: 'Quiet Fox',
      finalizedAt: null,
    });
    render(<AddFriendScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText('addFriend.placeholder'),
      'quietfox',
    );
    fireEvent.press(screen.getByText('addFriend.search'));
    expect(await screen.findByText('addFriend.viewProfile')).toBeTruthy();
  });

  it('navigates to UserProfile with the matched uid when View profile is pressed', async () => {
    mockedFindUid.mockResolvedValueOnce('friend-uid');
    mockedGetAvatar.mockResolvedValueOnce({
      animalKey: 'fox',
      displayName: 'Quiet Fox',
      finalizedAt: null,
    });
    render(<AddFriendScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText('addFriend.placeholder'),
      'quietfox',
    );
    fireEvent.press(screen.getByText('addFriend.search'));
    fireEvent.press(await screen.findByText('addFriend.viewProfile'));
    expect(mockNavigate).toHaveBeenCalledWith('UserProfile', { uid: 'friend-uid' });
  });

  it('shows not-found when the matched user has no avatar identity', async () => {
    mockedFindUid.mockResolvedValueOnce('friend-uid');
    mockedGetAvatar.mockResolvedValueOnce(null);
    render(<AddFriendScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText('addFriend.placeholder'),
      'quietfox',
    );
    fireEvent.press(screen.getByText('addFriend.search'));
    await waitFor(() => {
      expect(screen.getByText('addFriend.notFound')).toBeTruthy();
    });
  });

  it('shows not-found when the lookup throws', async () => {
    mockedFindUid.mockRejectedValueOnce(new Error('network error'));
    render(<AddFriendScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText('addFriend.placeholder'),
      'quietfox',
    );
    fireEvent.press(screen.getByText('addFriend.search'));
    await waitFor(() => {
      expect(screen.getByText('addFriend.notFound')).toBeTruthy();
    });
  });

  it('passes the raw input to findUidByHandle (normalization happens inside)', async () => {
    mockedFindUid.mockResolvedValueOnce(null);
    render(<AddFriendScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText('addFriend.placeholder'),
      '  QuietFox  ',
    );
    fireEvent.press(screen.getByText('addFriend.search'));
    await waitFor(() => {
      expect(mockedFindUid).toHaveBeenCalledWith('  QuietFox  ');
    });
  });
});
