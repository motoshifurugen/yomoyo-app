import type { ReadingActivity } from './readingActivity';

export const HISTORY_WINDOW_WEEKS = 36;

export type WeekBucket = {
  weekStart: Date;
  count: number;
};

export type BucketOptions = {
  weeks: number;
  now?: Date;
};

function getMondayWeekStart(date: Date): Date {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfWeek = (local.getDay() + 6) % 7; // Mon=0 … Sun=6
  local.setDate(local.getDate() - dayOfWeek);
  return local;
}

function shiftWeeks(monday: Date, deltaWeeks: number): Date {
  const shifted = new Date(monday);
  shifted.setDate(shifted.getDate() + deltaWeeks * 7);
  return shifted;
}

export function bucketActivitiesByWeek(
  activities: ReadingActivity[],
  options: BucketOptions,
): WeekBucket[] {
  const lastWeekStart = getMondayWeekStart(options.now ?? new Date());

  const buckets: WeekBucket[] = [];
  for (let i = options.weeks - 1; i >= 0; i--) {
    buckets.push({ weekStart: shiftWeeks(lastWeekStart, -i), count: 0 });
  }

  const indexByMs = new Map<number, number>();
  buckets.forEach((b, i) => indexByMs.set(b.weekStart.getTime(), i));

  for (const activity of activities) {
    if (!activity.finishedAt) continue;
    const weekStart = getMondayWeekStart(activity.finishedAt.toDate());
    const idx = indexByMs.get(weekStart.getTime());
    if (idx !== undefined) {
      buckets[idx] = { ...buckets[idx], count: buckets[idx].count + 1 };
    }
  }

  return buckets;
}
