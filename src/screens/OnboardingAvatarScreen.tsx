import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import PressableSurface from '@/components/ui/PressableSurface';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

type Nav = NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingAvatar'>;

export default function OnboardingAvatarScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(makeStyles);

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
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 24) + 16 },
      ]}
    >
      <OnboardingProgress
        currentStep={2}
        totalSteps={3}
        accessibilityLabel={t('onboarding.progressLabel', { current: 2, total: 3 })}
      />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{t('onboarding.avatarHeading')}</Text>
        <View style={styles.gridWrapper}>
          <AnimalGridPicker selected={animalKey} onSelect={setAnimalKey} />
        </View>
        <Text style={styles.label}>{t('profile.displayName.label')}</Text>
        <DisplayNameInput value={displayName} onChangeText={setDisplayName} error={error} />
      </ScrollView>
      <View style={styles.actions}>
        <PressableSurface
          testID="onboarding-avatar-continue"
          style={[styles.button, !canContinue && styles.buttonDisabled]}
          onPress={handleContinue}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canContinue }}
          disabled={!canContinue}
          feedback="confirming"
        >
          <Text style={styles.buttonText}>{t('onboarding.avatarContinue')}</Text>
        </PressableSurface>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: yomoyoSpacing.horizontalPadding,
    },
    scroll: {
      paddingTop: 24,
      paddingBottom: 16,
    },
    heading: {
      fontSize: yomoyoTypography.bodySize,
      fontWeight: yomoyoTypography.bodyWeight,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 24,
    },
    gridWrapper: {
      marginBottom: 24,
    },
    label: {
      fontSize: yomoyoTypography.secondaryActionSize,
      fontWeight: yomoyoTypography.secondaryActionWeight,
      color: colors.text,
      marginBottom: 8,
    },
    actions: {
      paddingTop: 16,
    },
    button: {
      height: yomoyoSpacing.buttonHeight,
      borderRadius: yomoyoSpacing.buttonRadius,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonDisabled: {
      backgroundColor: colors.muted,
    },
    buttonText: {
      color: colors.surface,
      fontSize: yomoyoTypography.buttonSize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
  });
