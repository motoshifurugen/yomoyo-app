import React from 'react';
import { View, StyleSheet } from 'react-native';
import { yomoyoColors } from '@/constants/yomoyoTheme';

type Props = {
  currentStep: number;
  totalSteps: number;
  accessibilityLabel?: string;
};

export default function OnboardingProgress({ currentStep, totalSteps, accessibilityLabel }: Props) {
  const clamped = Math.min(Math.max(currentStep, 1), totalSteps);
  const segments = Array.from({ length: totalSteps }, (_, i) => i);
  const label = accessibilityLabel ?? `Step ${clamped} of ${totalSteps}`;

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      style={styles.container}
    >
      {segments.map((i) => {
        const filled = i < clamped;
        const isCurrent = i === clamped - 1;
        return (
          <View
            key={i}
            testID={`onboarding-progress-segment-${i}`}
            accessibilityState={{ selected: filled }}
            style={[
              styles.segment,
              filled ? styles.segmentFilledColor : styles.segmentEmptyColor,
              isCurrent ? styles.segmentWide : styles.segmentNarrow,
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  segment: {
    height: 4,
    borderRadius: 2,
  },
  segmentNarrow: {
    flex: 1,
  },
  segmentWide: {
    flex: 2,
  },
  segmentFilledColor: {
    backgroundColor: yomoyoColors.primary,
  },
  segmentEmptyColor: {
    backgroundColor: yomoyoColors.border,
  },
});
