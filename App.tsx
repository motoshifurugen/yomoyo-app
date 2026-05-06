import './src/lib/firebase';
import React, { useEffect, useMemo, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from '@/navigation/RootNavigator';
import i18n, { loadSavedLanguage } from '@/lib/i18n';
import { linkingConfig } from '@/navigation/linkingConfig';
import { initAdMob } from '@/lib/ads/initAdMob';
import { ThemeProvider, useTheme } from '@/lib/theme';

function ThemedRoot() {
  const { resolved, colors } = useTheme();

  const navTheme = useMemo(() => {
    const base = resolved === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
      },
    };
  }, [resolved, colors]);

  return (
    <NavigationContainer theme={navTheme} linking={linkingConfig}>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

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
      <ThemeProvider>
        <ThemedRoot />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
