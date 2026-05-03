import React, { useState } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import {
  AppleButton,
  AppleButtonType,
  AppleButtonStyle,
  AppleError,
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
      if (e && typeof e === 'object' && 'code' in e && (e as any).code === AppleError.CANCELED) return;
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
            buttonType={AppleButtonType.CONTINUE}
            buttonStyle={AppleButtonStyle.BLACK}
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
