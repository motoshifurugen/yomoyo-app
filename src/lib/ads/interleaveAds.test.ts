import { interleaveAds } from './interleaveAds';

type Sample = { id: string };

const make = (n: number): Sample[] =>
  Array.from({ length: n }, (_, i) => ({ id: `item-${i}` }));

describe('interleaveAds', () => {
  it('returns an empty list for an empty input', () => {
    expect(interleaveAds<Sample>([], 6)).toEqual([]);
  });

  it('returns just items when fewer than the cadence is provided', () => {
    const items = make(5);
    const rows = interleaveAds(items, 6);
    expect(rows).toHaveLength(5);
    expect(rows.every((r) => r.kind === 'item')).toBe(true);
  });

  it('does not append a trailing ad when item count equals the cadence', () => {
    const items = make(6);
    const rows = interleaveAds(items, 6);
    expect(rows).toHaveLength(6);
    expect(rows.every((r) => r.kind === 'item')).toBe(true);
  });

  it('inserts an ad after every Nth item, only when more items follow', () => {
    const items = make(13);
    const rows = interleaveAds(items, 6);

    expect(rows[0].kind).toBe('item');
    expect(rows[5].kind).toBe('item');
    expect(rows[6].kind).toBe('ad');
    expect(rows[7].kind).toBe('item');
    expect(rows[12].kind).toBe('item');
    expect(rows[13].kind).toBe('ad');
    expect(rows[14].kind).toBe('item');
    expect(rows).toHaveLength(15);
  });

  it('never places an ad at the first position', () => {
    for (const n of [1, 6, 7, 12, 13, 50]) {
      const rows = interleaveAds(make(n), 6);
      if (rows.length > 0) {
        expect(rows[0].kind).toBe('item');
      }
    }
  });

  it('produces stable, unique ad keys per ad position', () => {
    const rows = interleaveAds(make(13), 6);
    const adKeys = rows.filter((r) => r.kind === 'ad').map((r) => r.key);
    expect(new Set(adKeys).size).toBe(adKeys.length);
    expect(adKeys.every((k) => typeof k === 'string' && k.length > 0)).toBe(true);
  });

  it('treats invalid cadence (<= 0) as “no ads”', () => {
    const items = make(20);
    expect(interleaveAds(items, 0).every((r) => r.kind === 'item')).toBe(true);
    expect(interleaveAds(items, -3).every((r) => r.kind === 'item')).toBe(true);
  });
});
