import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';
import type { WeekBucket } from '@/lib/books/readingHistory';

type Props = {
  buckets: WeekBucket[];
  formatTileLabel?: (bucket: WeekBucket) => string;
};

const TILE_SIZE = 12;
const TILE_GAP = 3;
const TILE_RADIUS = 3;

function opacityForCount(count: number): number {
  if (count <= 0) return 0.1;
  if (count === 1) return 0.35;
  if (count === 2) return 0.65;
  return 1;
}

export default function ReadingHistoryHeatmap({ buckets, formatTileLabel }: Props) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.row} testID="reading-history-heatmap" accessibilityRole="image">
      {buckets.map((bucket, index) => {
        const label = formatTileLabel
          ? formatTileLabel(bucket)
          : String(bucket.count);
        return (
          <View
            key={`${bucket.weekStart.getTime()}-${index}`}
            testID={`history-tile-${index}`}
            accessibilityLabel={label}
            accessibilityRole="image"
            style={[styles.tile, { opacity: opacityForCount(bucket.count) }]}
          />
        );
      })}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tile: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      marginRight: TILE_GAP,
      borderRadius: TILE_RADIUS,
      backgroundColor: colors.primary,
    },
  });
