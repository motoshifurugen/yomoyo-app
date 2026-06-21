import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, yomoyoTypography } from '@/constants/yomoyoTheme';
import { useTheme, useThemedStyles, type ThemeColors } from '@/lib/theme';

const ICON_SIZE = 48;

export type EmptyStateProps = {
  /** The guiding sentence shown to the user. */
  message: string;
  /** Optional bold headline above the message. */
  title?: string;
  /** Optional Ionicons glyph shown above the title. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** The "next action" — typically a CTA button. Rendered below the message. */
  action?: React.ReactNode;
  testID?: string;
};

/**
 * Centered empty-state block that always points the user to a next action
 * (#112). Used for empty feeds, shelves, and first-run screens so a blank
 * state never leaves the user wondering what to do next.
 */
export default function EmptyState({ message, title, icon, action, testID }: EmptyStateProps) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.container} testID={testID}>
      {icon ? (
        <Ionicons name={icon} size={ICON_SIZE} color={colors.muted} style={styles.icon} />
      ) : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.message}>{message}</Text>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xxl,
    },
    icon: {
      marginBottom: spacing.md,
    },
    title: {
      fontSize: yomoyoTypography.screenTitleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    message: {
      fontSize: yomoyoTypography.screenBodySize,
      lineHeight: yomoyoTypography.screenBodyLineHeight,
      color: colors.secondaryText,
      textAlign: 'center',
    },
    action: {
      marginTop: spacing.lg,
    },
  });
