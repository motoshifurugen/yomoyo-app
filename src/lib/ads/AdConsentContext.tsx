import React, { createContext, useContext, useEffect, useState } from 'react';
import { gatherAdConsent } from './adConsent';
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
    // Gather consent first, then initialize the Ads SDK — UMP must precede ads.
    gatherAdConsent()
      .then((nonPersonalized) => {
        if (active) setNonPersonalized(nonPersonalized);
      })
      .finally(() => {
        void initAdMob();
      });
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
