import React from 'react';
import { View, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { yomoyoGlass } from '@/constants/yomoyoTheme';

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

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={60} tint="light" style={[glassStyle, style]}>
        {children}
      </BlurView>
    );
  }

  return (
    <View style={[styles.fallback, glassStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: yomoyoGlass.strongBackground,
  },
});
