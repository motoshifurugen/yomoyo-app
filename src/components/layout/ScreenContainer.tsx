import React from 'react';
import { View, StyleSheet } from 'react-native';
import { yomoyoColors } from '@/constants/yomoyoTheme';

type Props = {
  children: React.ReactNode;
  bottomInset?: number;
};

export default function ScreenContainer({ children, bottomInset = 0 }: Props) {
  return (
    <View style={[styles.container, bottomInset > 0 && { paddingBottom: bottomInset }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: yomoyoColors.background,
    paddingHorizontal: 24,
  },
});
