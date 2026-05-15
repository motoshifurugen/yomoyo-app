import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import PressableSurface from '@/components/ui/PressableSurface';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(makeStyles);

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
      <View
        testID="edit-profile-header"
        style={[styles.header, { paddingTop: Math.max(12, insets.top + 4) }]}
      >
        <PressableSurface
          testID="edit-profile-cancel"
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          style={styles.headerCancel}
          feedback="standard"
        >
          <Text style={styles.headerSecondary}>{t('profile.edit.cancel')}</Text>
        </PressableSurface>
        <Text style={styles.headerTitle}>{t('profile.edit.title')}</Text>
        <PressableSurface
          testID="edit-profile-save"
          onPress={handleSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          style={styles.headerSave}
          feedback="confirming"
        >
          <Text style={[styles.headerPrimary, !canSave && styles.headerPrimaryDisabled]}>
            {t('profile.edit.save')}
          </Text>
        </PressableSurface>
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

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: yomoyoSpacing.horizontalPadding,
      paddingBottom: 12,
    },
    headerCancel: {
      marginLeft: 8,
    },
    headerSave: {
      marginRight: 8,
    },
    headerTitle: {
      fontSize: yomoyoTypography.headerTitleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
    },
    headerPrimary: {
      fontSize: yomoyoTypography.secondaryActionSize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.primary,
    },
    headerPrimaryDisabled: {
      color: colors.muted,
    },
    headerSecondary: {
      fontSize: yomoyoTypography.secondaryActionSize,
      color: colors.secondaryText,
    },
    body: {
      paddingHorizontal: yomoyoSpacing.horizontalPadding,
      paddingBottom: 24,
    },
    label: {
      fontSize: yomoyoTypography.secondaryActionSize,
      fontWeight: yomoyoTypography.secondaryActionWeight,
      color: colors.text,
      marginBottom: 8,
    },
    gridSpacer: {
      height: 24,
    },
  });
