import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import {
  generateRandomIdentity,
  saveAvatarIdentity,
  ANIMAL_ASSETS,
} from '@/lib/users/avatarIdentity';
import type { DraftIdentity } from '@/lib/users/avatarIdentity';
import type { OnboardingStackParamList } from '@/navigation/types';
import { yomoyoColors, yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingAvatar'>;

export default function OnboardingAvatarScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [identity, setIdentity] = useState<DraftIdentity>(() => generateRandomIdentity());

  const handleReroll = () => {
    setIdentity(generateRandomIdentity());
  };

  const handleContinue = async () => {
    try {
      // user is always set here (avatar screen follows sign-in), guard is for type safety
      if (user) {
        await saveAvatarIdentity(user.uid, identity);
      }
    } catch {
      // Save failure should not block onboarding progress
    }
    navigation.navigate('OnboardingNotification');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>{t('onboarding.avatarHeading')}</Text>
        <View style={styles.avatarFrame}>
          <Image
            testID="avatar-image"
            source={ANIMAL_ASSETS[identity.animalKey]}
            style={styles.avatarImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.label}>{identity.displayLabel}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleContinue} accessibilityRole="button">
          <Text style={styles.buttonText}>{t('onboarding.avatarContinue')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleReroll} accessibilityRole="button">
          <Text style={styles.reroll}>{t('onboarding.rerollButton')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: yomoyoColors.background,
    paddingHorizontal: yomoyoSpacing.horizontalPadding,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 64,
  },
  heading: {
    fontSize: yomoyoTypography.bodySize,
    fontWeight: yomoyoTypography.bodyWeight,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
    marginBottom: 32,
  },
  avatarFrame: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: yomoyoColors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatarImage: {
    width: 120,
    height: 120,
  },
  label: {
    fontSize: yomoyoTypography.titleSize,
    fontWeight: yomoyoTypography.titleWeight,
    color: yomoyoColors.text,
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: yomoyoSpacing.buttonHeight,
    borderRadius: yomoyoSpacing.buttonRadius,
    backgroundColor: yomoyoColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: yomoyoColors.surface,
    fontSize: yomoyoTypography.buttonSize,
    fontWeight: yomoyoTypography.buttonWeight,
  },
  reroll: {
    fontSize: yomoyoTypography.secondaryActionSize,
    fontWeight: yomoyoTypography.secondaryActionWeight,
    color: yomoyoColors.muted,
  },
});
