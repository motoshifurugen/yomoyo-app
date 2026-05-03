import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function AuthLogoBlock() {
  return (
    <View style={styles.container}>
      <Image
        testID="yomoyo-logo"
        source={require('../../../assets/images/yomoyo_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subtitle}>Book notes from friends.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 220,
    height: 96,
    alignSelf: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#5F6F6F',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
