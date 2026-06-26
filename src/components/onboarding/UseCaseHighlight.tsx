import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useTheme, useThemedStyles, type ThemeColors } from '@/lib/theme';

type Props = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  testID?: string;
};

// A single "ingredient" of an onboarding use case: an Ionicons glyph in a soft
// circle next to a short label. Shared by the receive and send concept screens
// so both stay visually consistent.
export default function UseCaseHighlight({ icon, label, testID }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.row} testID={testID}>
      <View
        style={styles.iconCircle}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.selectedBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      flex: 1,
      fontSize: yomoyoTypography.bodySize,
      fontWeight: yomoyoTypography.bodyWeight,
      color: colors.text,
    },
  });
