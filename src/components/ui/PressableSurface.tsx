import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { MOTION_PRESETS, type FeedbackLevel } from '@/constants/yomoyoMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  feedback?: FeedbackLevel;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

export default function PressableSurface({
  feedback = 'standard',
  style,
  disabled,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Props) {
  const preset = MOTION_PRESETS[feedback];
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const animatesScale = preset.pressedScale !== 1;

  const handlePressIn: PressableProps['onPressIn'] = (event) => {
    if (!disabled) {
      Animated.timing(opacity, {
        toValue: preset.pressedOpacity,
        duration: preset.pressInMs,
        useNativeDriver: true,
      }).start();
      if (animatesScale) {
        Animated.timing(scale, {
          toValue: preset.pressedScale,
          duration: preset.pressInMs,
          useNativeDriver: true,
        }).start();
      }
    }
    onPressIn?.(event);
  };

  const handlePressOut: PressableProps['onPressOut'] = (event) => {
    if (!disabled) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: preset.pressOutMs,
        useNativeDriver: true,
      }).start();
      if (animatesScale) {
        Animated.timing(scale, {
          toValue: 1,
          duration: preset.pressOutMs,
          useNativeDriver: true,
        }).start();
      }
    }
    onPressOut?.(event);
  };

  const animatedStyle: Animated.WithAnimatedObject<ViewStyle> = animatesScale
    ? { opacity, transform: [{ scale }] }
    : { opacity };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
