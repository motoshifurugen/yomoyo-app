import React, { useState } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { yomoyoColors, yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AppleButton,
  appleAuth,
} from '@invertase/react-native-apple-authentication';
import { signInWithGoogle } from '@/lib/auth/google';
import { signInWithApple } from '@/lib/auth/apple';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
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
      navigation.navigate('OnboardingAvatar');
    } catch (e) {
      if (e instanceof Error && e.message.includes('cancelled')) return;
      setError(t('onboarding.signInError'));
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    try {
      await signInWithApple();
      navigation.navigate('OnboardingAvatar');
    } catch (e) {
      if (e && typeof e === 'object' && 'code' in e && (e as any).code === appleAuth.Error.CANCELED) return;
      setError(t('onboarding.signInError'));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBlock}>
        <OnboardingProgress
          currentStep={1}
          totalSteps={3}
          accessibilityLabel={t('onboarding.progressLabel', { current: 1, total: 3 })}
        />
      </View>

      <View style={styles.intro}>
        <Text style={styles.heading}>{t('onboarding.introHeading')}</Text>
        <Text style={styles.body}>{t('onboarding.introBody')}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.buttons}>
        <GoogleSignInButton onPress={handleGoogleSignIn} />

        {Platform.OS === 'ios' && (
          <AppleButton
            testID="apple-signin-button"
            buttonType={AppleButton.Type.CONTINUE}
            buttonStyle={AppleButton.Style.BLACK}
            cornerRadius={14}
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
    paddingHorizontal: yomoyoSpacing.horizontalPadding,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: yomoyoColors.background,
  },
  progressBlock: {
    paddingTop: 8,
  },
  intro: {
    flex: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: yomoyoTypography.titleSize,
    fontWeight: yomoyoTypography.titleWeight,
    color: yomoyoColors.text,
    textAlign: 'center',
    marginBottom: 18,
  },
  body: {
    fontSize: yomoyoTypography.bodySize,
    fontWeight: yomoyoTypography.bodyWeight,
    lineHeight: yomoyoTypography.bodyLineHeight,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
  },
  error: {
    color: yomoyoColors.error,
    fontSize: yomoyoTypography.errorSize,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    width: '100%',
  },
  appleButton: {
    width: '100%',
    height: yomoyoSpacing.buttonHeight,
  },
});
