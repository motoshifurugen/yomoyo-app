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
  const [isNavigating, setIsNavigating] = useState(false);

  const handleReroll = () => {
    if (isNavigating) return;
    setIdentity(generateRandomIdentity());
  };

  const handleContinue = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    // user is always set here (avatar screen follows sign-in), guard is for type safety
    if (user) {
      saveAvatarIdentity(user.uid, identity).catch(() => {});
    }
    navigation.navigate('OnboardingNotification');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>{t('onboarding.avatarHeading')}</Text>
        <Image
          testID="avatar-image"
          source={ANIMAL_ASSETS[identity.animalKey]}
          style={styles.avatarImage}
          resizeMode="contain"
        />
        <Text style={styles.label}>{identity.displayLabel}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleReroll}
          style={styles.rerollRow}
          accessibilityRole="button"
          disabled={isNavigating}
        >
          <Text style={styles.rerollIcon}>↻</Text>
          <Text style={styles.rerollText}>{t('onboarding.rerollButton')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isNavigating && styles.buttonDisabled]}
          onPress={handleContinue}
          accessibilityRole="button"
          disabled={isNavigating}
        >
          <Text style={styles.buttonText}>{t('onboarding.avatarContinue')}</Text>
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
    marginBottom: 56,
  },
  heading: {
    fontSize: yomoyoTypography.bodySize,
    fontWeight: yomoyoTypography.bodyWeight,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
    marginBottom: 32,
  },
  avatarImage: {
    width: 140,
    height: 140,
    marginBottom: 24,
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
  rerollRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rerollIcon: {
    fontSize: 20,
    color: yomoyoColors.muted,
    marginRight: 6,
  },
  rerollText: {
    fontSize: yomoyoTypography.secondaryActionSize,
    fontWeight: yomoyoTypography.secondaryActionWeight,
    color: yomoyoColors.muted,
  },
  button: {
    width: '100%',
    height: yomoyoSpacing.buttonHeight,
    borderRadius: yomoyoSpacing.buttonRadius,
    backgroundColor: yomoyoColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: yomoyoColors.muted,
  },
  buttonText: {
    color: yomoyoColors.surface,
    fontSize: yomoyoTypography.buttonSize,
    fontWeight: yomoyoTypography.buttonWeight,
  },
});
