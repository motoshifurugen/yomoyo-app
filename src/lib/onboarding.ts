import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_KEY = 'yomoyo_onboarding_done';

export async function checkFirstLaunch(): Promise<boolean> {
  const done = await AsyncStorage.getItem(ONBOARDING_KEY);
  return done === null;
}

export async function markOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}
