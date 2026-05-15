import React from 'react';
import { Image, Text, StyleSheet } from 'react-native';
import PressableSurface from '@/components/ui/PressableSurface';
import { yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

interface Props {
  onPress: () => void;
}

export default function GoogleSignInButton({ onPress }: Props) {
  const styles = useThemedStyles(makeStyles);
  return (
    <PressableSurface
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      feedback="standard"
    >
      <Image
        testID="google-icon"
        source={require('../../../assets/images/google_g_logo.png')}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.label}>Continue with Google</Text>
    </PressableSurface>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      width: '100%',
      height: yomoyoSpacing.buttonHeight,
      backgroundColor: colors.surface,
      borderRadius: yomoyoSpacing.buttonRadius,
      borderWidth: 1,
      borderColor: colors.googleButtonBorder,
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
      color: colors.text,
    },
  });
