import './src/lib/firebase';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '@/navigation/RootNavigator';
import i18n, { loadSavedLanguage } from '@/lib/i18n';
import { linkingConfig } from '@/navigation/linkingConfig';
import { initAdMob } from '@/lib/ads/initAdMob';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSavedLanguage()
      .then((lang) => (lang ? i18n.changeLanguage(lang) : undefined))
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, []);

  useEffect(() => {
    void initAdMob();
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linkingConfig}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
