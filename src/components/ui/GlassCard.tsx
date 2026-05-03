import React from 'react';
import { View, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native';
import GlassSurface from './GlassSurface';
import { yomoyoGlass } from '@/constants/yomoyoTheme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function GlassCard({ children, style }: Props) {
  return (
    <View style={[styles.shadow, style]}>
      <GlassSurface borderRadius={24} style={styles.inner}>
        {children}
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: yomoyoGlass.shadow,
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
