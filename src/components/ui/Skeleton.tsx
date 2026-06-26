import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/lib/theme';

const PULSE_MIN_OPACITY = 0.4;
const PULSE_MAX_OPACITY = 1;
const PULSE_DURATION_MS = 800;
const DEFAULT_HEIGHT = 16;
const DEFAULT_RADIUS = 6;

export type SkeletonProps = {
  /** Block width. Accepts any RN dimension value (number or percentage string). */
  width?: ViewStyle['width'];
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * A single placeholder block that pulses while content loads.
 *
 * Purely decorative: hidden from screen readers (the enclosing skeleton group
 * exposes a single "loading" label). Honors the OS "reduce motion" setting by
 * skipping the pulse animation.
 */
export default function Skeleton({
  width = '100%',
  height = DEFAULT_HEIGHT,
  borderRadius = DEFAULT_RADIUS,
  style,
  testID,
}: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(PULSE_MAX_OPACITY)).current;

  useEffect(() => {
    let cancelled = false;
    let loop: Animated.CompositeAnimation | null = null;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (cancelled || reduceMotion) return;
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: PULSE_MIN_OPACITY,
              duration: PULSE_DURATION_MS,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: PULSE_MAX_OPACITY,
              duration: PULSE_DURATION_MS,
              useNativeDriver: true,
            }),
          ]),
        );
        loop.start();
      })
      .catch(() => {
        // Reduce-motion lookup is best-effort; fall back to a static block.
      });

    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius, backgroundColor: colors.border, opacity },
        style,
      ]}
    />
  );
}
