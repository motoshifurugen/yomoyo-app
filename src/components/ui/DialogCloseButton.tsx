import React from 'react';
import { Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import PressableSurface from './PressableSurface';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

type Props = {
  label: string;
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export default function DialogCloseButton({
  label,
  onPress,
  testID,
  accessibilityLabel,
  style,
}: Props) {
  const themed = useThemedStyles(makeStyles);
  return (
    <PressableSurface
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[baseStyles.button, style]}
      feedback="standard"
    >
      <Text style={themed.label}>{label}</Text>
    </PressableSurface>
  );
}

const baseStyles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
});

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    label: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.muted,
    },
  });
