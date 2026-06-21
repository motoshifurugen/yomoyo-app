import React from 'react';
import { Text } from 'react-native';
import { render, screen, waitFor } from '@testing-library/react-native';
import { AdConsentProvider, useAdConsent } from './AdConsentContext';
import { AdsConsent } from 'react-native-google-mobile-ads';

const mockAdsConsent = AdsConsent as jest.Mocked<typeof AdsConsent>;

function Probe() {
  const { requestNonPersonalizedAdsOnly } = useAdConsent();
  return <Text testID="npa">{String(requestNonPersonalizedAdsOnly)}</Text>;
}

describe('AdConsentContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the privacy-safe default (NPA) when used without a provider', () => {
    render(<Probe />);
    expect(screen.getByTestId('npa').props.children).toBe('true');
  });

  it('resolves to personalized ads once consent is gathered (NOT_REQUIRED region)', async () => {
    mockAdsConsent.getConsentInfo.mockResolvedValue({ status: 'NOT_REQUIRED' });
    mockAdsConsent.getPurposeConsents.mockResolvedValue('');
    render(
      <AdConsentProvider>
        <Probe />
      </AdConsentProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId('npa').props.children).toBe('false');
    });
  });

  it('keeps non-personalized ads when consent is not granted', async () => {
    mockAdsConsent.getConsentInfo.mockResolvedValue({ status: 'REQUIRED' });
    mockAdsConsent.getPurposeConsents.mockResolvedValue('');
    render(
      <AdConsentProvider>
        <Probe />
      </AdConsentProvider>,
    );
    await waitFor(() => {
      expect(mockAdsConsent.requestInfoUpdate).toHaveBeenCalled();
    });
    expect(screen.getByTestId('npa').props.children).toBe('true');
  });
});
