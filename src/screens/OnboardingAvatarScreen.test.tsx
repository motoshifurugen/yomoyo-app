import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import OnboardingAvatarScreen from './OnboardingAvatarScreen';
import { useNavigation } from '@react-navigation/native';
import { saveAvatarIdentity } from '@/lib/users/avatarIdentity';
import { ensureHandle } from '@/lib/users/handles';

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
    saveAvatarIdentity: jest.fn(() => Promise.resolve()),
  };
});

jest.mock('@/lib/users/handles', () => ({
  ensureHandle: jest.fn(() => Promise.resolve('quietfox')),
}));

describe('OnboardingAvatarScreen', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useNavigation).mockReturnValue({ navigate: mockNavigate } as any);
  });

  it('renders the avatar grid picker', () => {
    render(<OnboardingAvatarScreen />);
    expect(screen.getByTestId('animal-grid-picker')).toBeTruthy();
  });

  it('renders a 3-step progress indicator at step 2', () => {
    render(<OnboardingAvatarScreen />);
    expect(screen.getAllByTestId(/onboarding-progress-segment-/)).toHaveLength(3);
    expect(screen.getByTestId('onboarding-progress-segment-0').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByTestId('onboarding-progress-segment-1').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByTestId('onboarding-progress-segment-2').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it('renders the displayName input', () => {
    render(<OnboardingAvatarScreen />);
    expect(screen.getByTestId('display-name-input')).toBeTruthy();
  });

  it('does not render a reroll button', () => {
    render(<OnboardingAvatarScreen />);
    expect(screen.queryByText('onboarding.rerollButton')).toBeNull();
  });

  it('renders a continue button', () => {
    render(<OnboardingAvatarScreen />);
    expect(screen.getByTestId('onboarding-avatar-continue')).toBeTruthy();
  });

  it('disables continue when displayName is empty', () => {
    render(<OnboardingAvatarScreen />);
    fireEvent.press(screen.getByTestId('onboarding-avatar-continue'));
    expect(saveAvatarIdentity).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables continue when displayName is too long', () => {
    render(<OnboardingAvatarScreen />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'a'.repeat(21));
    fireEvent.press(screen.getByTestId('onboarding-avatar-continue'));
    expect(saveAvatarIdentity).not.toHaveBeenCalled();
  });

  it('saves and navigates with the typed displayName when valid', async () => {
    render(<OnboardingAvatarScreen />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), '  Foxy  ');
    fireEvent.press(screen.getByTestId('onboarding-avatar-continue'));
    await waitFor(() => {
      expect(saveAvatarIdentity).toHaveBeenCalledWith('user1', {
        animalKey: expect.any(String),
        displayName: 'Foxy',
      });
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification');
    });
  });

  it('persists the picked animal when continuing', async () => {
    render(<OnboardingAvatarScreen />);
    fireEvent.press(screen.getByTestId('animal-cell-wolf'));
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Lone');
    fireEvent.press(screen.getByTestId('onboarding-avatar-continue'));
    await waitFor(() => {
      expect(saveAvatarIdentity).toHaveBeenCalledWith('user1', {
        animalKey: 'wolf',
        displayName: 'Lone',
      });
    });
  });

  it('reserves a handle for the user when continue is pressed', async () => {
    render(<OnboardingAvatarScreen />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Foxy');
    fireEvent.press(screen.getByTestId('onboarding-avatar-continue'));
    await waitFor(() => {
      expect(ensureHandle).toHaveBeenCalledWith('user1');
    });
  });

  it('navigates synchronously without waiting for the save to complete', () => {
    jest.mocked(saveAvatarIdentity).mockReturnValueOnce(new Promise(() => {}));
    render(<OnboardingAvatarScreen />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Foxy');
    fireEvent.press(screen.getByTestId('onboarding-avatar-continue'));
    expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification');
  });

  it('still navigates when saveAvatarIdentity rejects', async () => {
    jest.mocked(saveAvatarIdentity).mockRejectedValueOnce(new Error('network error'));
    render(<OnboardingAvatarScreen />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Foxy');
    fireEvent.press(screen.getByTestId('onboarding-avatar-continue'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification');
    });
  });

  it('still navigates when ensureHandle rejects', async () => {
    jest.mocked(ensureHandle).mockRejectedValueOnce(new Error('reservation failed'));
    render(<OnboardingAvatarScreen />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Foxy');
    fireEvent.press(screen.getByTestId('onboarding-avatar-continue'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification');
    });
  });

  it('prevents a second tap while the first save is in progress', () => {
    jest.mocked(saveAvatarIdentity).mockReturnValueOnce(new Promise(() => {}));
    render(<OnboardingAvatarScreen />);
    fireEvent.changeText(screen.getByTestId('display-name-input'), 'Foxy');
    fireEvent.press(screen.getByTestId('onboarding-avatar-continue'));
    fireEvent.press(screen.getByTestId('onboarding-avatar-continue'));
    expect(jest.mocked(saveAvatarIdentity)).toHaveBeenCalledTimes(1);
  });
});
