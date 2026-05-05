import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import OnboardingAvatarScreen from './OnboardingAvatarScreen';
import { useNavigation } from '@react-navigation/native';
import { generateRandomIdentity, saveAvatarIdentity } from '@/lib/users/avatarIdentity';
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

jest.mock('@/lib/users/avatarIdentity', () => ({
  generateRandomIdentity: jest.fn(() => ({
    animalKey: 'fox',
    adjective: 'Quiet',
    displayLabel: 'Quiet Fox',
  })),
  saveAvatarIdentity: jest.fn(() => Promise.resolve()),
  ANIMAL_ASSETS: { fox: 1, bear: 2 },
}));

jest.mock('@/lib/users/handles', () => ({
  ensureHandle: jest.fn(() => Promise.resolve('quietfox')),
}));

describe('OnboardingAvatarScreen', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useNavigation).mockReturnValue({ navigate: mockNavigate } as any);
    jest.mocked(generateRandomIdentity).mockReturnValue({
      animalKey: 'fox',
      adjective: 'Quiet',
      displayLabel: 'Quiet Fox',
    });
  });

  it('shows the display label of the assigned identity', () => {
    render(<OnboardingAvatarScreen />);
    expect(screen.getByText('Quiet Fox')).toBeTruthy();
  });

  it('renders an animal image', () => {
    render(<OnboardingAvatarScreen />);
    expect(screen.getByTestId('avatar-image')).toBeTruthy();
  });

  it('renders a reroll button', () => {
    render(<OnboardingAvatarScreen />);
    expect(screen.getByText('onboarding.rerollButton')).toBeTruthy();
  });

  it('renders a continue button', () => {
    render(<OnboardingAvatarScreen />);
    expect(screen.getByText('onboarding.avatarContinue')).toBeTruthy();
  });

  it('calls generateRandomIdentity again when reroll is pressed', () => {
    render(<OnboardingAvatarScreen />);
    const callsBefore = jest.mocked(generateRandomIdentity).mock.calls.length;
    fireEvent.press(screen.getByText('onboarding.rerollButton'));
    expect(jest.mocked(generateRandomIdentity).mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('updates the displayed label after reroll', () => {
    jest.mocked(generateRandomIdentity)
      .mockReturnValueOnce({ animalKey: 'fox', adjective: 'Quiet', displayLabel: 'Quiet Fox' })
      .mockReturnValueOnce({ animalKey: 'bear', adjective: 'Bold', displayLabel: 'Bold Bear' });

    render(<OnboardingAvatarScreen />);
    fireEvent.press(screen.getByText('onboarding.rerollButton'));
    expect(screen.getByText('Bold Bear')).toBeTruthy();
  });

  it('calls saveAvatarIdentity with userId and identity when continue is pressed', async () => {
    render(<OnboardingAvatarScreen />);
    fireEvent.press(screen.getByText('onboarding.avatarContinue'));
    await waitFor(() => {
      expect(saveAvatarIdentity).toHaveBeenCalledWith('user1', {
        animalKey: 'fox',
        adjective: 'Quiet',
        displayLabel: 'Quiet Fox',
      });
    });
  });

  it('navigates to OnboardingNotification after continue', async () => {
    render(<OnboardingAvatarScreen />);
    fireEvent.press(screen.getByText('onboarding.avatarContinue'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification');
    });
  });

  it('navigates synchronously without waiting for the save to complete', () => {
    // Navigation must not be blocked by the async Firestore write
    jest.mocked(saveAvatarIdentity).mockReturnValueOnce(new Promise(() => {}));
    render(<OnboardingAvatarScreen />);
    fireEvent.press(screen.getByText('onboarding.avatarContinue'));
    expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification');
  });

  it('still navigates to OnboardingNotification even if saveAvatarIdentity throws', async () => {
    jest.mocked(saveAvatarIdentity).mockRejectedValueOnce(new Error('network error'));
    render(<OnboardingAvatarScreen />);
    fireEvent.press(screen.getByText('onboarding.avatarContinue'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification');
    });
  });

  it('prevents a second tap while the first save is in progress', () => {
    jest.mocked(saveAvatarIdentity).mockReturnValueOnce(new Promise(() => {}));
    render(<OnboardingAvatarScreen />);
    fireEvent.press(screen.getByText('onboarding.avatarContinue'));
    fireEvent.press(screen.getByText('onboarding.avatarContinue'));
    expect(jest.mocked(saveAvatarIdentity)).toHaveBeenCalledTimes(1);
  });

  it('reserves a handle for the user when continue is pressed', async () => {
    render(<OnboardingAvatarScreen />);
    fireEvent.press(screen.getByText('onboarding.avatarContinue'));
    await waitFor(() => {
      expect(ensureHandle).toHaveBeenCalledWith('user1');
    });
  });

  it('still navigates to OnboardingNotification when ensureHandle fails', async () => {
    jest.mocked(ensureHandle).mockRejectedValueOnce(new Error('reservation failed'));
    render(<OnboardingAvatarScreen />);
    fireEvent.press(screen.getByText('onboarding.avatarContinue'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification');
    });
  });
});
