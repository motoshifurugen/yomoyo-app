jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkFirstLaunch, markOnboardingDone, ONBOARDING_KEY } from '@/lib/onboarding';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('checkFirstLaunch', () => {
  it('returns true when no onboarding record exists', async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);
    expect(await checkFirstLaunch()).toBe(true);
  });

  it('returns false when onboarding is already done', async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce('true');
    expect(await checkFirstLaunch()).toBe(false);
  });
});

describe('markOnboardingDone', () => {
  it('saves the onboarding key to AsyncStorage', async () => {
    await markOnboardingDone();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(ONBOARDING_KEY, 'true');
  });
});
