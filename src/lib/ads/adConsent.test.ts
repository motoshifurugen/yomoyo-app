import { shouldRequestNonPersonalizedAds, gatherAdConsent } from './adConsent';
import { AdsConsent } from 'react-native-google-mobile-ads';

const mockAdsConsent = AdsConsent as jest.Mocked<typeof AdsConsent>;

describe('shouldRequestNonPersonalizedAds', () => {
  it('serves personalized ads outside GDPR (NOT_REQUIRED)', () => {
    expect(shouldRequestNonPersonalizedAds('NOT_REQUIRED')).toBe(false);
  });

  it('serves personalized ads when consent is OBTAINED and purpose 1 is granted', () => {
    expect(shouldRequestNonPersonalizedAds('OBTAINED', '1')).toBe(false);
  });

  it('serves non-personalized ads when consent is OBTAINED but purpose 1 is denied', () => {
    expect(shouldRequestNonPersonalizedAds('OBTAINED', '0')).toBe(true);
  });

  it('serves non-personalized ads when consent is OBTAINED but no purpose string', () => {
    expect(shouldRequestNonPersonalizedAds('OBTAINED', '')).toBe(true);
    expect(shouldRequestNonPersonalizedAds('OBTAINED', undefined)).toBe(true);
  });

  it('serves non-personalized ads before consent is granted (REQUIRED / UNKNOWN)', () => {
    expect(shouldRequestNonPersonalizedAds('REQUIRED')).toBe(true);
    expect(shouldRequestNonPersonalizedAds('UNKNOWN')).toBe(true);
  });
});

describe('gatherAdConsent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests an info update and shows the consent form if required', async () => {
    await gatherAdConsent();
    expect(mockAdsConsent.requestInfoUpdate).toHaveBeenCalled();
    expect(mockAdsConsent.loadAndShowConsentFormIfRequired).toHaveBeenCalled();
  });

  it('returns personalized (false) when status is NOT_REQUIRED', async () => {
    mockAdsConsent.getConsentInfo.mockResolvedValueOnce({ status: 'NOT_REQUIRED' });
    mockAdsConsent.getPurposeConsents.mockResolvedValueOnce('');
    await expect(gatherAdConsent()).resolves.toBe(false);
  });

  it('returns personalized (false) when consent obtained with purpose 1 granted', async () => {
    mockAdsConsent.getConsentInfo.mockResolvedValueOnce({ status: 'OBTAINED' });
    mockAdsConsent.getPurposeConsents.mockResolvedValueOnce('1');
    await expect(gatherAdConsent()).resolves.toBe(false);
  });

  it('returns non-personalized (true) when consent obtained but purpose 1 denied', async () => {
    mockAdsConsent.getConsentInfo.mockResolvedValueOnce({ status: 'OBTAINED' });
    mockAdsConsent.getPurposeConsents.mockResolvedValueOnce('0');
    await expect(gatherAdConsent()).resolves.toBe(true);
  });

  it('falls back to non-personalized (true) when the UMP flow throws', async () => {
    mockAdsConsent.requestInfoUpdate.mockRejectedValueOnce(new Error('boom'));
    await expect(gatherAdConsent()).resolves.toBe(true);
  });
});
