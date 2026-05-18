import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import MyIdentityHeader from './MyIdentityHeader';
import { getAvatarIdentity, ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/lib/users/avatarIdentity', () => {
  const actual = jest.requireActual('@/lib/users/avatarIdentity');
  return {
    ...actual,
    getAvatarIdentity: jest.fn(),
    saveAvatarIdentity: jest.fn(() => Promise.resolve()),
  };
});

jest.mock('@/components/shelf/AvatarPickerModal', () => {
  const { Text, View } = require('react-native');
  return function AvatarPickerModal({
    visible,
    onClose,
  }: {
    visible: boolean;
    onClose: () => void;
  }) {
    if (!visible) return null;
    return (
      <View testID="avatar-picker-modal">
        <Text testID="avatar-picker-modal-close" onPress={onClose}>
          close
        </Text>
      </View>
    );
  };
});

jest.mock('@/components/shelf/InlineDisplayNameEditor', () => {
  const { Text, View } = require('react-native');
  return function InlineDisplayNameEditor({
    onComplete,
    onCancel,
  }: {
    onComplete: () => void;
    onCancel: () => void;
  }) {
    return (
      <View testID="inline-display-name-editor">
        <Text testID="inline-editor-complete" onPress={onComplete}>
          complete
        </Text>
        <Text testID="inline-editor-cancel" onPress={onCancel}>
          cancel
        </Text>
      </View>
    );
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

  it('renders nothing when getAvatarIdentity resolves to null', async () => {
    mockedGetAvatarIdentity.mockResolvedValueOnce(null);
    render(<MyIdentityHeader uid="user1" />);
    await waitFor(() => expect(mockedGetAvatarIdentity).toHaveBeenCalled());
    expect(screen.queryByTestId('my-identity-avatar')).toBeNull();
    expect(screen.queryByTestId('my-identity-name-button')).toBeNull();
  });

  it('does not render an edit-hint chevron text', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    expect(screen.queryByText('shelf.editHint')).toBeNull();
  });

  it('does not open the avatar modal initially', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    expect(screen.queryByTestId('avatar-picker-modal')).toBeNull();
  });

  it('opens the avatar modal when the avatar is pressed', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    fireEvent.press(screen.getByTestId('my-identity-avatar-button'));
    expect(screen.getByTestId('avatar-picker-modal')).toBeTruthy();
  });

  it('closes the avatar modal when the modal triggers onClose', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    fireEvent.press(screen.getByTestId('my-identity-avatar-button'));
    fireEvent.press(screen.getByTestId('avatar-picker-modal-close'));
    expect(screen.queryByTestId('avatar-picker-modal')).toBeNull();
  });

  it('does not show the inline name editor initially', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    expect(screen.queryByTestId('inline-display-name-editor')).toBeNull();
  });

  it('enters inline name edit mode when the name is pressed', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    fireEvent.press(screen.getByTestId('my-identity-name-button'));
    expect(screen.getByTestId('inline-display-name-editor')).toBeTruthy();
  });

  it('exits inline name edit mode when onComplete is called', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    fireEvent.press(screen.getByTestId('my-identity-name-button'));
    fireEvent.press(screen.getByTestId('inline-editor-complete'));
    expect(screen.queryByTestId('inline-display-name-editor')).toBeNull();
  });

  it('exits inline name edit mode when onCancel is called', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    fireEvent.press(screen.getByTestId('my-identity-name-button'));
    fireEvent.press(screen.getByTestId('inline-editor-cancel'));
    expect(screen.queryByTestId('inline-display-name-editor')).toBeNull();
  });

  it('refetches identity after the avatar modal is closed', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    expect(mockedGetAvatarIdentity).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByTestId('my-identity-avatar-button'));
    fireEvent.press(screen.getByTestId('avatar-picker-modal-close'));
    await waitFor(() => expect(mockedGetAvatarIdentity).toHaveBeenCalledTimes(2));
  });

  it('refetches identity after the inline editor completes', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    expect(mockedGetAvatarIdentity).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByTestId('my-identity-name-button'));
    fireEvent.press(screen.getByTestId('inline-editor-complete'));
    await waitFor(() => expect(mockedGetAvatarIdentity).toHaveBeenCalledTimes(2));
  });

  it('does not refetch identity when the inline editor is cancelled', async () => {
    render(<MyIdentityHeader uid="user1" />);
    await screen.findByText('Foxy');
    expect(mockedGetAvatarIdentity).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByTestId('my-identity-name-button'));
    fireEvent.press(screen.getByTestId('inline-editor-cancel'));
    expect(mockedGetAvatarIdentity).toHaveBeenCalledTimes(1);
  });

  it('does not warn about updates after unmount when a pending fetch resolves', async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    mockedGetAvatarIdentity.mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveFetch = resolve;
      }),
    );
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<MyIdentityHeader uid="user1" />);
    unmount();
    resolveFetch({ animalKey: 'fox', displayName: 'Foxy', finalizedAt: null });
    await new Promise((r) => setImmediate(r));
    expect(errorSpy).not.toHaveBeenCalledWith(
      expect.stringMatching(/unmounted/i),
      expect.anything(),
    );
    errorSpy.mockRestore();
  });
});
