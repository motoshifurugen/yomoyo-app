import { bucketActivitiesByWeek } from './readingHistory';
import type { ReadingActivity } from './readingActivity';

function makeActivity(finishedAt: Date | null): ReadingActivity {
  return {
    id: `act-${finishedAt ? finishedAt.toISOString() : 'null'}`,
    userId: 'u1',
    bookId: 'b1',
    title: 'A Book',
    authors: ['Author'],
    thumbnail: null,
    status: 'finished',
    finishedAt: finishedAt
      ? { toDate: () => finishedAt, toMillis: () => finishedAt.getTime() }
      : null,
  };
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Anchor: Friday 2026-05-22 (matches the project's currentDate)
// Monday of that week = 2026-05-18
const now = new Date(2026, 4, 22);

describe('bucketActivitiesByWeek', () => {
  it('returns exactly `weeks` buckets', () => {
    expect(bucketActivitiesByWeek([], { weeks: 26, now })).toHaveLength(26);
  });

  it('returns buckets in chronological order (oldest first)', () => {
    const result = bucketActivitiesByWeek([], { weeks: 4, now });
    for (let i = 1; i < result.length; i++) {
      expect(result[i].weekStart.getTime()).toBeGreaterThan(
        result[i - 1].weekStart.getTime(),
      );
    }
  });

  it('separates adjacent week-starts by 7 days', () => {
    const result = bucketActivitiesByWeek([], { weeks: 4, now });
    for (let i = 1; i < result.length; i++) {
      const diffDays = Math.round(
        (result[i].weekStart.getTime() - result[i - 1].weekStart.getTime()) /
          MS_PER_DAY,
      );
      expect(diffDays).toBe(7);
    }
  });

  it('uses Monday as the week-start day', () => {
    const result = bucketActivitiesByWeek([], { weeks: 4, now });
    for (const b of result) {
      expect(b.weekStart.getDay()).toBe(1);
    }
  });

  it('pins weekStart to local midnight', () => {
    const result = bucketActivitiesByWeek([], { weeks: 4, now });
    for (const b of result) {
      expect(b.weekStart.getHours()).toBe(0);
      expect(b.weekStart.getMinutes()).toBe(0);
      expect(b.weekStart.getSeconds()).toBe(0);
      expect(b.weekStart.getMilliseconds()).toBe(0);
    }
  });

  it("anchors the last bucket to the Monday of `now`'s week", () => {
    const result = bucketActivitiesByWeek([], { weeks: 4, now });
    const last = result[result.length - 1];
    expect(last.weekStart.getFullYear()).toBe(2026);
    expect(last.weekStart.getMonth()).toBe(4); // May
    expect(last.weekStart.getDate()).toBe(18);
  });

  it('initializes counts to 0 when no activities are passed', () => {
    const result = bucketActivitiesByWeek([], { weeks: 4, now });
    expect(result.every((b) => b.count === 0)).toBe(true);
  });

  it("increments the current week's bucket for an activity finished this week", () => {
    const result = bucketActivitiesByWeek(
      [makeActivity(new Date(2026, 4, 19, 12, 0))], // Tue 2026-05-19
      { weeks: 4, now },
    );
    expect(result[result.length - 1].count).toBe(1);
    expect(result.slice(0, -1).every((b) => b.count === 0)).toBe(true);
  });

  it('sums multiple activities in the same week', () => {
    const result = bucketActivitiesByWeek(
      [
        makeActivity(new Date(2026, 4, 19, 12)),
        makeActivity(new Date(2026, 4, 20, 12)),
        makeActivity(new Date(2026, 4, 21, 12)),
      ],
      { weeks: 4, now },
    );
    expect(result[result.length - 1].count).toBe(3);
  });

  it('places earlier activities in earlier buckets', () => {
    // Mon 2026-05-11 belongs to (now - 1) week
    const result = bucketActivitiesByWeek(
      [makeActivity(new Date(2026, 4, 11, 9))],
      { weeks: 4, now },
    );
    expect(result[result.length - 2].count).toBe(1);
    expect(result[result.length - 1].count).toBe(0);
  });

  it('ignores activities older than the window', () => {
    // 4-week window from now (2026-05-22 Fri):
    // first bucket weekStart = 2026-04-27 (Mon)
    // 2026-04-20 is one week before the window
    const result = bucketActivitiesByWeek(
      [makeActivity(new Date(2026, 3, 20, 12))],
      { weeks: 4, now },
    );
    expect(result.every((b) => b.count === 0)).toBe(true);
  });

  it('ignores activities in the future (after the current week)', () => {
    const result = bucketActivitiesByWeek(
      [makeActivity(new Date(2026, 4, 26, 12))], // Tue 2026-05-26
      { weeks: 4, now },
    );
    expect(result.every((b) => b.count === 0)).toBe(true);
  });

  it('ignores activities with null finishedAt', () => {
    const result = bucketActivitiesByWeek([makeActivity(null)], {
      weeks: 4,
      now,
    });
    expect(result.every((b) => b.count === 0)).toBe(true);
  });

  it('treats Monday 00:00 as belonging to the new week, not the previous one', () => {
    const result = bucketActivitiesByWeek(
      [makeActivity(new Date(2026, 4, 18, 0, 0, 0, 0))],
      { weeks: 4, now },
    );
    expect(result[result.length - 1].count).toBe(1);
    expect(result[result.length - 2].count).toBe(0);
  });

  it('treats Sunday 23:59 as belonging to the ending week', () => {
    const result = bucketActivitiesByWeek(
      [makeActivity(new Date(2026, 4, 17, 23, 59, 59, 999))], // Sun 2026-05-17
      { weeks: 4, now },
    );
    expect(result[result.length - 2].count).toBe(1);
    expect(result[result.length - 1].count).toBe(0);
  });

  it('defaults `now` to current time when not provided', () => {
    // We only assert the shape — current time is implementation-dependent here.
    const result = bucketActivitiesByWeek([], { weeks: 3 });
    expect(result).toHaveLength(3);
    for (const b of result) {
      expect(b.weekStart.getDay()).toBe(1);
    }
  });
});
