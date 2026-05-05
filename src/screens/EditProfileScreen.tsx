import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useAuth } from '@/hooks/useAuth';
import {
  getAvatarIdentity,
  saveAvatarIdentity,
  defaultAnimalKey,
  validateDisplayName,
} from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';
import AnimalGridPicker from '@/components/profile/AnimalGridPicker';
import DisplayNameInput from '@/components/profile/DisplayNameInput';
import type { RootStackParamList } from '@/navigation/types';
import { yomoyoColors, yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [animalKey, setAnimalKey] = useState<AnimalKey>(() => defaultAnimalKey());
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getAvatarIdentity(user.uid)
      .then((identity) => {
        if (cancelled || !identity) return;
        setAnimalKey(identity.animalKey);
        setDisplayName(identity.displayName);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const validation = useMemo(() => validateDisplayName(displayName), [displayName]);
  const error = !validation.ok && displayName.length > 0 ? validation.reason : undefined;
  const canSave = validation.ok && !isSaving;

  const handleSave = async () => {
    if (!user || !validation.ok || isSaving) return;
    setIsSaving(true);
    try {
      await saveAvatarIdentity(user.uid, { animalKey, displayName: validation.value });
      navigation.goBack();
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity
          testID="edit-profile-cancel"
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Text style={styles.headerSecondary}>{t('profile.edit.cancel')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.edit.title')}</Text>
        <TouchableOpacity
          testID="edit-profile-save"
          onPress={handleSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
        >
          <Text style={[styles.headerPrimary, !canSave && styles.headerPrimaryDisabled]}>
            {t('profile.edit.save')}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{t('profile.displayName.label')}</Text>
        <DisplayNameInput value={displayName} onChangeText={setDisplayName} error={error} />
        <View style={styles.gridSpacer} />
        <AnimalGridPicker selected={animalKey} onSelect={setAnimalKey} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: yomoyoSpacing.horizontalPadding,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: yomoyoTypography.headerTitleSize,
    fontWeight: yomoyoTypography.titleWeight,
    color: yomoyoColors.text,
  },
  headerPrimary: {
    fontSize: yomoyoTypography.secondaryActionSize,
    fontWeight: yomoyoTypography.buttonWeight,
    color: yomoyoColors.primary,
  },
  headerPrimaryDisabled: {
    color: yomoyoColors.muted,
  },
  headerSecondary: {
    fontSize: yomoyoTypography.secondaryActionSize,
    color: yomoyoColors.secondaryText,
  },
  body: {
    paddingHorizontal: yomoyoSpacing.horizontalPadding,
    paddingBottom: 24,
  },
  label: {
    fontSize: yomoyoTypography.secondaryActionSize,
    fontWeight: yomoyoTypography.secondaryActionWeight,
    color: yomoyoColors.text,
    marginBottom: 8,
  },
  gridSpacer: {
    height: 24,
  },
});
