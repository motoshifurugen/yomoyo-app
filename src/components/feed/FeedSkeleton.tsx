import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Skeleton from '@/components/ui/Skeleton';
import { spacing } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

const DEFAULT_COUNT = 5;
const AVATAR_SIZE = 32;
const THUMB_WIDTH = 52;
const THUMB_HEIGHT = 72;
const THUMB_RADIUS = 6;
const NAME_WIDTH = 120;
const LINE_HEIGHT = 14;
const DATE_HEIGHT = 12;
const TITLE_WIDTH = '80%';
const DATE_WIDTH = '40%';

export type FeedSkeletonProps = {
  /** Number of placeholder cards to render. */
  count?: number;
};

/**
 * Loading placeholder for the timeline / bookmarks feed. Mirrors the layout of
 * {@link ActivityCard} so the transition to real content is visually stable.
 */
export default function FeedSkeleton({ count = DEFAULT_COUNT }: FeedSkeletonProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);

  return (
    <View
      testID="feed-skeleton"
      style={styles.list}
      accessibilityRole="progressbar"
      accessibilityLabel={t('common.loading')}
      accessibilityState={{ busy: true }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} testID="feed-skeleton-card" style={styles.card}>
          <View style={styles.header}>
            <Skeleton width={AVATAR_SIZE} height={AVATAR_SIZE} borderRadius={AVATAR_SIZE / 2} />
            <Skeleton width={NAME_WIDTH} height={LINE_HEIGHT} style={styles.name} />
          </View>
          <View style={styles.body}>
            <Skeleton width={THUMB_WIDTH} height={THUMB_HEIGHT} borderRadius={THUMB_RADIUS} />
            <View style={styles.info}>
              <Skeleton width={TITLE_WIDTH} height={LINE_HEIGHT} />
              <Skeleton width={DATE_WIDTH} height={DATE_HEIGHT} style={styles.date} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    list: { paddingTop: spacing.xl, paddingBottom: spacing.lg },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    name: {
      marginLeft: spacing.sm,
    },
    body: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    info: {
      flex: 1,
      marginLeft: spacing.md,
      justifyContent: 'center',
    },
    date: {
      marginTop: spacing.sm,
    },
  });
