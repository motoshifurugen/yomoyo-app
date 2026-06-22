import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';
import type { WeekBucket } from '@/lib/books/readingHistory';

type Props = {
  buckets: WeekBucket[];
  formatTileLabel?: (bucket: WeekBucket) => string;
};

const ROWS = 3;
const TILE_SIZE = 9;
const TILE_GAP = 2;
const TILE_RADIUS = 2;
const OPACITY_BANDS = [0.1, 0.35, 0.65, 1] as const;

function opacityForCount(count: number): number {
  if (count <= 0) return OPACITY_BANDS[0];
  if (count === 1) return OPACITY_BANDS[1];
  if (count === 2) return OPACITY_BANDS[2];
  return OPACITY_BANDS[3];
}

function splitIntoRows<T>(items: T[], rowCount: number): T[][] {
  if (items.length === 0) return [];
  const perRow = Math.ceil(items.length / rowCount);
  const rows: T[][] = [];
  for (let r = 0; r < rowCount; r++) {
    rows.push(items.slice(r * perRow, (r + 1) * perRow));
  }
  return rows;
}

export default function ReadingHistoryHeatmap({ buckets, formatTileLabel }: Props) {
  const styles = useThemedStyles(makeStyles);
  const rows = splitIntoRows(buckets, ROWS);

  return (
    <View style={styles.grid} testID="reading-history-heatmap" accessibilityRole="image">
      {rows.map((rowBuckets, rowIndex) => {
        const startIndex = rowIndex * Math.ceil(buckets.length / ROWS);
        return (
          <View
            key={`row-${rowIndex}`}
            style={styles.row}
            testID={`history-row-${rowIndex}`}
          >
            {rowBuckets.map((bucket, colIndex) => {
              const index = startIndex + colIndex;
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
      })}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'column',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: TILE_GAP,
    },
    tile: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      marginRight: TILE_GAP,
      borderRadius: TILE_RADIUS,
      backgroundColor: colors.primary,
    },
  });
