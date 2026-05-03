import React, { useState } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AppleButton,
  appleAuth,
} from '@invertase/react-native-apple-authentication';
import { signInWithGoogle } from '@/lib/auth/google';
import { signInWithApple } from '@/lib/auth/apple';
import AuthLogoBlock from '@/components/auth/AuthLogoBlock';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
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
    } catch (e) {
      if (e && typeof e === 'object' && 'code' in e && (e as any).code === appleAuth.Error.CANCELED) return;
      setError(t('onboarding.signInError'));
    }
  };

  return (
    <View style={styles.container}>
      <AuthLogoBlock />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.buttons}>
        <GoogleSignInButton onPress={handleGoogleSignIn} />

        {Platform.OS === 'ios' && (
          <AppleButton
            testID="apple-signin-button"
            buttonType={AppleButton.Type.CONTINUE}
            buttonStyle={AppleButton.Style.BLACK}
            cornerRadius={10}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F3FAF9',
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
  },
  appleButton: {
    width: '100%',
    height: 54,
  },
});
