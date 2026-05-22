import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import ReadingHistoryHeatmap from './ReadingHistoryHeatmap';

const makeBucket = (year: number, month: number, day: number, count: number) => ({
  weekStart: new Date(year, month, day),
  count,
});

const fourWeeks = [
  makeBucket(2026, 3, 27, 0), // Apr 27, empty
  makeBucket(2026, 4, 4, 1),  // May 4, one
  makeBucket(2026, 4, 11, 2), // May 11, two
  makeBucket(2026, 4, 18, 5), // May 18, many
];

function flatStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean));
}

describe('ReadingHistoryHeatmap', () => {
  it('exposes a stable root testID', () => {
    render(<ReadingHistoryHeatmap buckets={fourWeeks} />);
    expect(screen.getByTestId('reading-history-heatmap')).toBeTruthy();
  });

  it('renders exactly one tile per bucket', () => {
    render(<ReadingHistoryHeatmap buckets={fourWeeks} />);
    expect(screen.getAllByTestId(/^history-tile-/)).toHaveLength(4);
  });

  it('uses the lowest opacity band for empty weeks', () => {
    render(<ReadingHistoryHeatmap buckets={fourWeeks} />);
    const tile = screen.getByTestId('history-tile-0');
    expect(flatStyle(tile.props.style).opacity).toBeLessThan(0.2);
  });

  it('uses a higher opacity band when at least one book was finished', () => {
    render(<ReadingHistoryHeatmap buckets={fourWeeks} />);
    const empty = flatStyle(screen.getByTestId('history-tile-0').props.style).opacity as number;
    const single = flatStyle(screen.getByTestId('history-tile-1').props.style).opacity as number;
    expect(single).toBeGreaterThan(empty);
  });

  it('saturates opacity at 1 when the count reaches the top band', () => {
    render(<ReadingHistoryHeatmap buckets={fourWeeks} />);
    const top = screen.getByTestId('history-tile-3');
    expect(flatStyle(top.props.style).opacity).toBe(1);
  });

  it('uses the same opacity for any count beyond the top band threshold', () => {
    render(
      <ReadingHistoryHeatmap
        buckets={[makeBucket(2026, 4, 18, 3), makeBucket(2026, 4, 18, 99)]}
      />,
    );
    const a = flatStyle(screen.getByTestId('history-tile-0').props.style).opacity;
    const b = flatStyle(screen.getByTestId('history-tile-1').props.style).opacity;
    expect(a).toBe(b);
  });

  it('uses formatTileLabel as the accessibility label when provided', () => {
    render(
      <ReadingHistoryHeatmap
        buckets={fourWeeks}
        formatTileLabel={(b) => `count=${b.count}`}
      />,
    );
    expect(screen.getByTestId('history-tile-3').props.accessibilityLabel).toBe('count=5');
  });

  it('falls back to the bare numeric count when no formatter is given', () => {
    render(<ReadingHistoryHeatmap buckets={fourWeeks} />);
    expect(screen.getByTestId('history-tile-3').props.accessibilityLabel).toBe('5');
  });

  it('renders no tiles when buckets is empty', () => {
    render(<ReadingHistoryHeatmap buckets={[]} />);
    expect(screen.queryAllByTestId(/^history-tile-/)).toHaveLength(0);
    expect(screen.getByTestId('reading-history-heatmap')).toBeTruthy();
  });
});
