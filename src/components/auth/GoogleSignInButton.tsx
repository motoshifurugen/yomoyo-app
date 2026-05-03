import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

interface Props {
  onPress: () => void;
}

export default function GoogleSignInButton({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} accessibilityRole="button">
      <Image
        testID="google-icon"
        source={require('../../../assets/images/google_g_logo.png')}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.label}>Continue with Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DED6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  icon: {
    width: 24,
    height: 24,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
    color: '#111827',
  },
});
