import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import OnboardingSendingScreen from './OnboardingSendingScreen';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockOnComplete = jest.fn();

describe('OnboardingSendingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sending heading key', () => {
    render(<OnboardingSendingScreen onComplete={mockOnComplete} />);
    expect(screen.getByText('onboarding.sendHeading')).toBeTruthy();
  });

  it('renders the sending body key', () => {
    render(<OnboardingSendingScreen onComplete={mockOnComplete} />);
    expect(screen.getByText('onboarding.sendBody')).toBeTruthy();
  });

  it('renders a 3-step progress indicator at step 3 (all filled)', () => {
    render(<OnboardingSendingScreen onComplete={mockOnComplete} />);
    expect(screen.getAllByTestId(/onboarding-progress-segment-/)).toHaveLength(3);
    expect(screen.getByTestId('onboarding-progress-segment-0').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByTestId('onboarding-progress-segment-1').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByTestId('onboarding-progress-segment-2').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it('renders the send use-case highlights', () => {
    render(<OnboardingSendingScreen onComplete={mockOnComplete} />);
    expect(screen.getByText('onboarding.sendHighlightShareId')).toBeTruthy();
    expect(screen.getByText('onboarding.sendHighlightRecord')).toBeTruthy();
  });

  it('renders a start button', () => {
    render(<OnboardingSendingScreen onComplete={mockOnComplete} />);
    expect(screen.getByTestId('onboarding-send-start')).toBeTruthy();
    expect(screen.getByText('onboarding.sendButton')).toBeTruthy();
  });

  it('calls onComplete when the start button is pressed', () => {
    render(<OnboardingSendingScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByTestId('onboarding-send-start'));
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });
});
