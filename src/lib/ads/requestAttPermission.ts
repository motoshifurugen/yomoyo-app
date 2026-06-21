import { Platform } from 'react-native';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

/**
 * Request iOS App Tracking Transparency permission.
 *
 * Must be called AFTER the UMP consent flow (Google requires UMP → ATT order).
 * Returns whether the user granted tracking (IDFA access). Non-iOS platforms
 * have no ATT and resolve true without prompting; failures resolve false so the
 * app stays on the privacy-safe (non-personalized) path.
 */
export async function requestAttPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') return true;
  try {
    const { granted } = await requestTrackingPermissionsAsync();
    return granted;
  } catch (err) {
    const e = err as { message?: string };
    console.error('[requestAttPermission] ATT request failed —', e?.message ?? err);
    return false;
  }
}
