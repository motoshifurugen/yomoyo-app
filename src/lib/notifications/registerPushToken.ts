import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { savePushToken, type PushTokenPlatform } from '@/lib/users/pushTokens';
import { getCurrentLanguage } from '@/lib/i18n';

function logFailure(stage: string, err: unknown) {
  if (!__DEV__) return;
  const isNoProjectId =
    err instanceof Error &&
    (err as { code?: string }).code === 'ERR_NOTIFICATIONS_NO_EXPERIENCE_ID';
  if (isNoProjectId) {
    console.warn(
      '[PushToken] Missing EAS project ID. Run `eas init` or set extra.eas.projectId in app.json, then restart the dev server.',
    );
  } else {
    console.warn(`[PushToken] ${stage} failed:`, err);
  }
}

async function fetchAndPersistToken(userId: string): Promise<void> {
  let token: string;
  try {
    const { data } = await Notifications.getExpoPushTokenAsync();
    token = data;
  } catch (err) {
    logFailure('Token retrieval', err);
    return;
  }

  if (__DEV__) {
    console.log('[PushToken] Expo push token:', token);
  }

  try {
    await savePushToken(
      userId,
      token,
      Platform.OS as PushTokenPlatform,
      getCurrentLanguage(),
    );
    if (__DEV__) {
      console.log('[PushToken] Persisted token for user:', userId);
    }
  } catch (err) {
    logFailure('Firestore persistence', err);
  }
}

export async function registerPushTokenAfterGrant(userId: string): Promise<void> {
  await fetchAndPersistToken(userId);
}

export async function registerPushTokenIfPermitted(userId: string): Promise<void> {
  let status: string;
  try {
    const result = await Notifications.getPermissionsAsync();
    status = result.status;
  } catch (err) {
    logFailure('Permission check', err);
    return;
  }
  if (status !== 'granted') return;
  await fetchAndPersistToken(userId);
}
