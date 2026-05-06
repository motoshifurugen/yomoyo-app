import React from 'react';
import { View, StyleSheet, Platform, NativeModules, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, useThemedStyles, type ThemeColors, type ThemeGlass } from '@/lib/theme';

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
  const { resolved, glass } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const glassStyle = {
    borderRadius,
    borderWidth: 1,
    borderColor: glass.border,
    overflow: 'hidden' as const,
  };

  if (BLUR_NATIVE_AVAILABLE) {
    return (
      <BlurView intensity={60} tint={resolved === 'dark' ? 'dark' : 'light'} style={[glassStyle, style]}>
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

const makeStyles = (_colors: ThemeColors, glass: ThemeGlass) =>
  StyleSheet.create({
    fallback: {
      backgroundColor: glass.background,
    },
  });
