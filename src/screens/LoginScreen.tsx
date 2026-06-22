import React, { useEffect, useState } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';
import {
  AppleButton,
  appleAuth,
} from '@invertase/react-native-apple-authentication';
import { signInWithGoogle } from '@/lib/auth/google';
import { signInWithApple } from '@/lib/auth/apple';
import {
  getBoundProvider,
  DeviceAccountMismatchError,
  type AuthProvider,
} from '@/lib/auth/deviceAccount';
import AuthLogoBlock from '@/components/auth/AuthLogoBlock';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

const PROVIDER_LABEL: Record<AuthProvider, string> = {
  google: 'Google',
  apple: 'Apple',
};

export default function LoginScreen() {
  const styles = useThemedStyles(makeStyles);
  const [signInError, setSignInError] = useState<string | null>(null);
  // 'unknown' until the device's bound provider is read, so we never flash a
  // button that should be hidden (one account per device).
  const [boundProvider, setBoundProvider] = useState<AuthProvider | null | 'unknown'>('unknown');

  useEffect(() => {
    getBoundProvider()
      .then((p) => setBoundProvider(p))
      .catch(() => setBoundProvider(null));
  }, []);

  const handleMismatch = (e: unknown): boolean => {
    if (e instanceof DeviceAccountMismatchError) {
      const label = PROVIDER_LABEL[e.boundProvider];
      setSignInError(`This device is already set up with ${label}. Please continue with ${label}.`);
      return true;
    }
    return false;
  };

  const handleGoogleSignIn = async () => {
    setSignInError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      if (e instanceof Error && e.message.includes('cancelled')) return;
      if (handleMismatch(e)) return;
      setSignInError('Sign-in failed. Please try again.');
    }
  };

  const handleAppleSignIn = async () => {
    setSignInError(null);
    try {
      await signInWithApple();
    } catch (e) {
      if (e && typeof e === 'object' && 'code' in e && (e as any).code === appleAuth.Error.CANCELED) return;
      if (handleMismatch(e)) return;
      setSignInError('Sign-in failed. Please try again.');
    }
  };

  // One account per device + Apple Guideline 4.8: hide Google only when the
  // device is bound to Apple; Apple stays available whenever Google is shown.
  const showGoogle = boundProvider !== 'apple';
  const showApple = Platform.OS === 'ios';

  return (
    <View style={styles.container}>
      <AuthLogoBlock />

      {signInError ? <Text style={styles.error}>{signInError}</Text> : null}

      {boundProvider !== 'unknown' && (
        <View style={styles.buttons}>
          {showGoogle && <GoogleSignInButton onPress={handleGoogleSignIn} />}

          {showApple && (
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
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: yomoyoSpacing.horizontalPadding,
      backgroundColor: colors.background,
    },
    error: {
      color: colors.error,
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
