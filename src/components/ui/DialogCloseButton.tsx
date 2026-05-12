import React from 'react';
import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
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
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[baseStyles.button, style]}
    >
      <Text style={themed.label}>{label}</Text>
    </Pressable>
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
