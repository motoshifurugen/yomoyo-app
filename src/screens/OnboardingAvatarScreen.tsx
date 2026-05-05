import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import {
  saveAvatarIdentity,
  defaultAnimalKey,
  validateDisplayName,
} from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';
import { ensureHandle } from '@/lib/users/handles';
import AnimalGridPicker from '@/components/profile/AnimalGridPicker';
import DisplayNameInput from '@/components/profile/DisplayNameInput';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import type { OnboardingStackParamList } from '@/navigation/types';
import { yomoyoColors, yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingAvatar'>;

export default function OnboardingAvatarScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [animalKey, setAnimalKey] = useState<AnimalKey>(() => defaultAnimalKey());
  const [displayName, setDisplayName] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const validation = useMemo(() => validateDisplayName(displayName), [displayName]);
  const error = !validation.ok && displayName.length > 0 ? validation.reason : undefined;
  const canContinue = validation.ok && !isNavigating;

  const handleContinue = () => {
    if (!canContinue || !validation.ok) return;
    setIsNavigating(true);
    if (user) {
      // Fire-and-forget: navigation must not block on Firestore.
      // On failure, the user can re-edit later from the profile screen.
      saveAvatarIdentity(user.uid, { animalKey, displayName: validation.value }).catch(() => {});
      ensureHandle(user.uid).catch(() => {});
    }
    navigation.navigate('OnboardingNotification');
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBlock}>
        <OnboardingProgress
          currentStep={2}
          totalSteps={3}
          accessibilityLabel={t('onboarding.progressLabel', { current: 2, total: 3 })}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{t('onboarding.avatarHeading')}</Text>
        <View style={styles.gridWrapper}>
          <AnimalGridPicker selected={animalKey} onSelect={setAnimalKey} />
        </View>
        <Text style={styles.label}>{t('profile.displayName.label')}</Text>
        <DisplayNameInput value={displayName} onChangeText={setDisplayName} error={error} />
      </ScrollView>
      <View style={styles.actions}>
        <TouchableOpacity
          testID="onboarding-avatar-continue"
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
          disabled={!canContinue}
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
  },
  progressBlock: {
    paddingTop: 8,
  },
  scroll: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  heading: {
    fontSize: yomoyoTypography.bodySize,
    fontWeight: yomoyoTypography.bodyWeight,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
    marginBottom: 24,
  },
  gridWrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: yomoyoTypography.secondaryActionSize,
    fontWeight: yomoyoTypography.secondaryActionWeight,
    color: yomoyoColors.text,
    marginBottom: 8,
  },
  actions: {
    paddingVertical: 16,
  },
  button: {
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
