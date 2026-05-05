import mobileAds from 'react-native-google-mobile-ads';
import { initAdMob, __resetAdMobInitForTests } from './initAdMob';

const mockedMobileAds = mobileAds as unknown as jest.Mock;
const getInitializeMock = () =>
  (mobileAds() as unknown as { initialize: jest.Mock }).initialize;

describe('initAdMob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    __resetAdMobInitForTests();
  });

  it('initializes the Mobile Ads SDK once on first call', async () => {
    await initAdMob();
    expect(mockedMobileAds).toHaveBeenCalled();
    expect(getInitializeMock()).toHaveBeenCalledTimes(1);
  });

  it('does not re-initialize on subsequent calls', async () => {
    await initAdMob();
    await initAdMob();
    await initAdMob();
    expect(getInitializeMock()).toHaveBeenCalledTimes(1);
  });

  it('swallows initialization errors so the app can still boot', async () => {
    getInitializeMock().mockRejectedValueOnce(new Error('boom'));
    await expect(initAdMob()).resolves.toBeUndefined();
  });
});
