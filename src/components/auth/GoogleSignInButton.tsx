import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';

interface Props {
  onPress: () => void;
}

export default function GoogleSignInButton({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} accessibilityRole="button">
      <View style={styles.inner}>
        <Image
          testID="google-icon"
          source={require('../../../assets/images/google_g_logo.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.label}>Continue with Google</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7E7E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 20,
    height: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
