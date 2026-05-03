import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { yomoyoColors, yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';

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
    height: yomoyoSpacing.buttonHeight,
    backgroundColor: yomoyoColors.surface,
    borderRadius: yomoyoSpacing.buttonRadius,
    borderWidth: 1,
    borderColor: yomoyoColors.googleButtonBorder,
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
    fontSize: yomoyoTypography.buttonSize,
    fontWeight: yomoyoTypography.buttonWeight,
    lineHeight: 22,
    color: yomoyoColors.text,
  },
});
