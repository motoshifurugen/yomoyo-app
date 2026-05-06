import React from 'react';
import { View, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import GlassSurface from './GlassSurface';
import { useThemedStyles, type ThemeColors, type ThemeGlass } from '@/lib/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function GlassCard({ children, style }: Props) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.shadow, style]}>
      <GlassSurface borderRadius={24} style={styles.inner}>
        {children}
      </GlassSurface>
    </View>
  );
}

const makeStyles = (colors: ThemeColors, glass: ThemeGlass) =>
  StyleSheet.create({
    shadow: {
      borderRadius: 24,
      backgroundColor: colors.surface,
      ...Platform.select({
        ios: {
          shadowColor: glass.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 12,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    inner: {
      padding: 20,
    },
  });
