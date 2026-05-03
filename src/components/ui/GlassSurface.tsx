import React from 'react';
import { View, StyleSheet, Platform, NativeModules, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { yomoyoGlass } from '@/constants/yomoyoTheme';

// True only when the expo-blur native module is compiled into the current build.
// Expo Go does not include it, so this will be false there.
const BLUR_NATIVE_AVAILABLE =
  Platform.OS === 'ios' && Boolean(NativeModules.ExpoBlurViewManager);

type Props = {
  children: React.ReactNode;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export default function GlassSurface({ children, borderRadius = 24, style }: Props) {
  const glassStyle = {
    borderRadius,
    borderWidth: 1,
    borderColor: yomoyoGlass.border,
    overflow: 'hidden' as const,
  };

  if (BLUR_NATIVE_AVAILABLE) {
    return (
      <BlurView intensity={60} tint="light" style={[glassStyle, style]}>
        {children}
      </BlurView>
    );
  }

  return (
    <View testID="glass-surface-fallback" style={[styles.fallback, glassStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: yomoyoGlass.background,
  },
});
