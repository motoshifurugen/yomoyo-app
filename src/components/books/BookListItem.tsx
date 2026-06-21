import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import PressableSurface from '@/components/ui/PressableSurface';
import { spacing, fontSize, yomoyoTypography } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

export type BookListItemProps = {
  title: string;
  authors: string[];
  thumbnail?: string | null;
  /** Pre-formatted date string. Omitted when not provided. */
  date?: string;
  /** When provided, the row becomes a pressable button. */
  onPress?: () => void;
  /** Shown instead of authors when the authors list is empty. */
  unknownAuthorLabel?: string;
  testID?: string;
  accessibilityLabel?: string;
};

/**
 * Shared book row card used across the Shelf, profile, and search screens
 * so finished/searched books share one consistent, spacious layout (#110).
 */
export default function BookListItem({
  title,
  authors,
  thumbnail,
  date,
  onPress,
  unknownAuthorLabel,
  testID,
  accessibilityLabel,
}: BookListItemProps) {
  const styles = useThemedStyles(makeStyles);
  const authorLabel = authors.length > 0 ? authors.join(', ') : (unknownAuthorLabel ?? '');

  const content = (
    <>
      {thumbnail ? (
        <Image
          source={{ uri: thumbnail }}
          style={styles.thumbnail}
          accessibilityLabel={title}
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        {authorLabel ? <Text style={styles.author}>{authorLabel}</Text> : null}
        {date ? <Text style={styles.date}>{date}</Text> : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <PressableSurface
        style={styles.card}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        feedback="soft"
      >
        {content}
      </PressableSurface>
    );
  }

  return (
    <View style={styles.card} testID={testID}>
      {content}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    thumbnail: {
      width: 52,
      height: 72,
      borderRadius: 6,
      marginRight: spacing.md,
    },
    thumbnailPlaceholder: {
      backgroundColor: colors.border,
    },
    info: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    author: {
      fontSize: fontSize.caption,
      color: colors.secondaryText,
    },
    date: {
      fontSize: 13,
      color: colors.muted,
      marginTop: spacing.xs,
    },
  });
