import { formatBookDate } from './formatBookDate';

// 2026-06-21 (month index 5 = June), constructed in local time so the
// formatter's local getters are deterministic regardless of timezone.
const june21 = new Date(2026, 5, 21);

describe('formatBookDate', () => {
  it('formats Japanese dates as Y年M月D日', () => {
    expect(formatBookDate(june21, 'ja')).toBe('2026年6月21日');
  });

  it('formats English dates as "Mon D, YYYY"', () => {
    expect(formatBookDate(june21, 'en')).toBe('Jun 21, 2026');
  });

  it('falls back to English formatting for unknown languages', () => {
    expect(formatBookDate(june21, 'fr')).toBe('Jun 21, 2026');
  });

  it('does not zero-pad month or day in Japanese', () => {
    expect(formatBookDate(new Date(2026, 0, 5), 'ja')).toBe('2026年1月5日');
  });

  it('does not zero-pad day in English', () => {
    expect(formatBookDate(new Date(2026, 0, 5), 'en')).toBe('Jan 5, 2026');
  });
});
