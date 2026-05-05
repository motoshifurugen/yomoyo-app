import React from 'react';
import { render, screen } from '@testing-library/react-native';
import OnboardingProgress from './OnboardingProgress';

describe('OnboardingProgress', () => {
  it('renders exactly totalSteps segments', () => {
    render(<OnboardingProgress currentStep={1} totalSteps={3} />);
    expect(screen.getAllByTestId(/onboarding-progress-segment-/)).toHaveLength(3);
  });

  it('marks the first currentStep segments as filled', () => {
    render(<OnboardingProgress currentStep={2} totalSteps={3} />);
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

  it('exposes an accessibility label describing the current step', () => {
    render(<OnboardingProgress currentStep={1} totalSteps={3} />);
    expect(screen.getByLabelText('Step 1 of 3')).toBeTruthy();
  });

  it('clamps currentStep below 1 to 1 (first segment filled)', () => {
    render(<OnboardingProgress currentStep={0} totalSteps={3} />);
    expect(screen.getByTestId('onboarding-progress-segment-0').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByTestId('onboarding-progress-segment-1').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
    expect(screen.getByLabelText('Step 1 of 3')).toBeTruthy();
  });

  it('clamps currentStep above totalSteps to totalSteps', () => {
    render(<OnboardingProgress currentStep={5} totalSteps={3} />);
    expect(screen.getByTestId('onboarding-progress-segment-2').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByLabelText('Step 3 of 3')).toBeTruthy();
  });

  it('makes only the current segment wider; past and future segments are narrow', () => {
    render(<OnboardingProgress currentStep={2} totalSteps={3} />);
    const flexOf = (id: string): number => {
      const styles = screen.getByTestId(id).props.style;
      const flat = (Array.isArray(styles) ? styles : [styles])
        .filter(Boolean)
        .reduce((acc, s) => ({ ...acc, ...s }), {} as Record<string, unknown>);
      return flat.flex as number;
    };
    expect(flexOf('onboarding-progress-segment-0')).toBe(1); // past, narrow
    expect(flexOf('onboarding-progress-segment-1')).toBe(2); // current, wide
    expect(flexOf('onboarding-progress-segment-2')).toBe(1); // future, narrow
  });
});
