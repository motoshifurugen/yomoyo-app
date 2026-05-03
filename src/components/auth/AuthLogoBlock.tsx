import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';

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
    marginBottom: 52,
  },
  logo: {
    width: 260,
    height: 260,
    alignSelf: 'center',
    marginBottom: 28,
  },
  subtitle: {
    fontSize: yomoyoTypography.subtitleSize,
    fontWeight: yomoyoTypography.subtitleWeight,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
