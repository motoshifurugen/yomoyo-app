import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

type Props = {
  children: React.ReactNode;
  bottomInset?: number;
};

export default function ScreenContainer({ children, bottomInset = 0 }: Props) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.container, bottomInset > 0 && { paddingBottom: bottomInset }]}>
      {children}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
    },
  });
