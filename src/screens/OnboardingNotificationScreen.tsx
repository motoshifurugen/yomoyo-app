import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import { markOnboardingDone } from '@/lib/onboarding';

type Props = {
  onComplete: () => void;
};

export default function OnboardingNotificationScreen({ onComplete }: Props) {
  const { t } = useTranslation();

  const handleAllow = async () => {
    await Notifications.requestPermissionsAsync();
    await markOnboardingDone();
    onComplete();
  };

  const handleSkip = async () => {
    await markOnboardingDone();
    onComplete();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('onboarding.notificationHeading')}</Text>
      <Text style={styles.body}>{t('onboarding.notificationBody')}</Text>
      <TouchableOpacity style={styles.button} onPress={handleAllow} accessibilityRole="button">
        <Text style={styles.buttonText}>{t('onboarding.allowButton')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSkip} accessibilityRole="button">
        <Text style={styles.skip}>{t('onboarding.skipLink')}</Text>
      </TouchableOpacity>
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
  heading: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  body: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 48, lineHeight: 24 },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  skip: { fontSize: 15, color: '#888' },
});
