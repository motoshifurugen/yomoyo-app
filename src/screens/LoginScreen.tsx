import React, { useState } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { yomoyoColors, yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';
import {
  AppleButton,
  appleAuth,
} from '@invertase/react-native-apple-authentication';
import { signInWithGoogle } from '@/lib/auth/google';
import { signInWithApple } from '@/lib/auth/apple';
import AuthLogoBlock from '@/components/auth/AuthLogoBlock';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function LoginScreen() {
  const [signInError, setSignInError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setSignInError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      if (e instanceof Error && e.message.includes('cancelled')) return;
      setSignInError('Sign-in failed. Please try again.');
    }
  };

  const handleAppleSignIn = async () => {
    setSignInError(null);
    try {
      await signInWithApple();
    } catch (e) {
      if (e && typeof e === 'object' && 'code' in e && (e as any).code === appleAuth.Error.CANCELED) return;
      setSignInError('Sign-in failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <AuthLogoBlock />

      {signInError ? <Text style={styles.error}>{signInError}</Text> : null}

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
    alignItems: 'center',
    justifyContent: 'center',
    padding: yomoyoSpacing.horizontalPadding,
    backgroundColor: yomoyoColors.background,
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
