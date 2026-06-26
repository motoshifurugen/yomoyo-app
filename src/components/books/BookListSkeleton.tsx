import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Skeleton from '@/components/ui/Skeleton';
import { spacing } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

const DEFAULT_COUNT = 4;
const THUMB_WIDTH = 52;
const THUMB_HEIGHT = 72;

export type BookListSkeletonProps = {
  /** Number of placeholder rows to render. */
  count?: number;
};

/**
 * Loading placeholder for finished-book lists (Shelf, user profiles). Mirrors
 * the layout of {@link BookListItem} for a stable load-to-content transition.
 */
export default function BookListSkeleton({ count = DEFAULT_COUNT }: BookListSkeletonProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);

  return (
    <View
      testID="book-list-skeleton"
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loading')}
      accessibilityState={{ busy: true }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} testID="book-list-skeleton-row" style={styles.card}>
          <Skeleton width={THUMB_WIDTH} height={THUMB_HEIGHT} borderRadius={6} style={styles.thumbnail} />
          <View style={styles.info}>
            <Skeleton width="70%" height={15} />
            <Skeleton width="45%" height={13} style={styles.author} />
          </View>
        </View>
      ))}
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
    },
    thumbnail: {
      marginRight: spacing.md,
    },
    info: {
      flex: 1,
      justifyContent: 'center',
    },
    author: {
      marginTop: spacing.sm,
    },
  });
