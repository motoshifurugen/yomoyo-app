import { AdsConsent } from 'react-native-google-mobile-ads';

/**
 * Decide whether ads must be requested as non-personalized (NPA), from the UMP
 * consent status and the TCF purpose-consent string.
 *
 * Privacy-safe by default: anything other than an explicit "personalized is OK"
 * yields NPA = true, so the app never serves tracking ads without consent.
 */
export function shouldRequestNonPersonalizedAds(
  status: string,
  purposeConsents?: string,
): boolean {
  if (status === 'NOT_REQUIRED') return false; // outside GDPR — personalized OK
  if (status === 'OBTAINED') {
    // TCF purpose 1 = "Store and/or access information on a device".
    return purposeConsents?.charAt(0) !== '1';
  }
  // REQUIRED or UNKNOWN: consent not yet granted — never track before consent.
  return true;
}

/**
 * Run the Google UMP consent flow at startup and resolve whether ad requests
 * must be non-personalized. Failures resolve to the privacy-safe default (NPA).
 */
export async function gatherAdConsent(): Promise<boolean> {
  try {
    await AdsConsent.requestInfoUpdate();
    await AdsConsent.loadAndShowConsentFormIfRequired();
    const info = await AdsConsent.getConsentInfo();
    const purposeConsents = await AdsConsent.getPurposeConsents();
    return shouldRequestNonPersonalizedAds(info.status, purposeConsents);
  } catch (err) {
    const e = err as { message?: string };
    console.error('[gatherAdConsent] UMP flow failed —', e?.message ?? err);
    return true;
  }
}
