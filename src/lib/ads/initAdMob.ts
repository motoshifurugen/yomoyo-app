import mobileAds from 'react-native-google-mobile-ads';

let initPromise: Promise<void> | null = null;

export function initAdMob(): Promise<void> {
  if (initPromise) return initPromise;
  const promise: Promise<void> = mobileAds()
    .initialize()
    .then(() => undefined)
    .catch((err: unknown) => {
      const e = err as { message?: string };
      console.error('[initAdMob] init failed —', e?.message ?? err);
      return undefined;
    });
  initPromise = promise;
  return promise;
}

export function __resetAdMobInitForTests(): void {
  initPromise = null;
}
