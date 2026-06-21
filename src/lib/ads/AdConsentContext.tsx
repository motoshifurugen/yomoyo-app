import React, { createContext, useContext, useEffect, useState } from 'react';
import { gatherAdConsent } from './adConsent';
import { requestAttPermission } from './requestAttPermission';
import { initAdMob } from './initAdMob';

export type AdConsentValue = {
  requestNonPersonalizedAdsOnly: boolean;
};

// Privacy-safe default: non-personalized until UMP consent resolves, so no
// tracking ad request can fire before consent is known.
const AdConsentContext = createContext<AdConsentValue>({
  requestNonPersonalizedAdsOnly: true,
});

export function AdConsentProvider({ children }: { children: React.ReactNode }) {
  const [requestNonPersonalizedAdsOnly, setNonPersonalized] = useState(true);

  useEffect(() => {
    let active = true;
    // Order matters: UMP consent first, then iOS ATT, then initialize ads.
    // Ads are non-personalized if UMP withholds consent OR ATT is not granted.
    (async () => {
      const umpNonPersonalized = await gatherAdConsent();
      const trackingGranted = await requestAttPermission();
      if (active) setNonPersonalized(umpNonPersonalized || !trackingGranted);
      void initAdMob();
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdConsentContext.Provider value={{ requestNonPersonalizedAdsOnly }}>
      {children}
    </AdConsentContext.Provider>
  );
}

export function useAdConsent(): AdConsentValue {
  return useContext(AdConsentContext);
}
