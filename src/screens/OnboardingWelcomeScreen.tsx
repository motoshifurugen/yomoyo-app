import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signInWithGoogle } from '@/lib/auth/google';
import { signInWithApple } from '@/lib/auth/apple';
import type { OnboardingStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingWelcome'>;

export default function OnboardingWelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
      navigation.navigate('OnboardingNotification');
    } catch (e) {
      if (e instanceof Error && e.message.includes('cancelled')) return;
      setError(t('onboarding.signInError'));
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    try {
      await signInWithApple();
      navigation.navigate('OnboardingNotification');
    } catch {
      setError(t('onboarding.signInError'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('onboarding.heading')}</Text>
      <Text style={styles.concept}>{t('onboarding.concept')}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn} accessibilityRole="button">
        <Text style={styles.buttonText}>{t('onboarding.signInWithGoogle')}</Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' && (
        <TouchableOpacity style={[styles.button, styles.appleButton]} onPress={handleAppleSignIn} accessibilityRole="button">
          <Text style={[styles.buttonText]}>{t('onboarding.signInWithApple')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  heading: { fontSize: 36, fontWeight: '700', marginBottom: 16 },
  concept: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 48, lineHeight: 24 },
  error: { color: '#d32f2f', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    marginBottom: 12,
  },
  appleButton: { backgroundColor: '#000' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
