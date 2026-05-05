export type FeedRow<T> =
  | { kind: 'item'; item: T }
  | { kind: 'ad'; key: string };

export function interleaveAds<T>(items: ReadonlyArray<T>, cadence: number): FeedRow<T>[] {
  if (items.length === 0) return [];
  if (!Number.isFinite(cadence) || cadence <= 0) {
    return items.map((item) => ({ kind: 'item', item }));
  }

  const rows: FeedRow<T>[] = [];
  for (let i = 0; i < items.length; i += 1) {
    if (i > 0 && i % cadence === 0) {
      rows.push({ kind: 'ad', key: `ad-${i}` });
    }
    rows.push({ kind: 'item', item: items[i] });
  }
  return rows;
}
