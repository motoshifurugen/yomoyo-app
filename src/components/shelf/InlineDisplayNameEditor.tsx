import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import PressableSurface from '@/components/ui/PressableSurface';
import DisplayNameInput from '@/components/profile/DisplayNameInput';
import { saveAvatarIdentity, validateDisplayName } from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

type Props = {
  uid: string;
  initialDisplayName: string;
  animalKey: AnimalKey;
  onComplete: () => void;
  onCancel: () => void;
};

export default function InlineDisplayNameEditor({
  uid,
  initialDisplayName,
  animalKey,
  onComplete,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const [value, setValue] = useState(initialDisplayName);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const validation = useMemo(() => validateDisplayName(value), [value]);
  const error = validation.ok ? undefined : validation.reason;
  const canSave = validation.ok && !isSaving;

  const handleChange = (next: string) => {
    setValue(next);
    if (saveError) setSaveError(null);
  };

  const handleSave = async () => {
    if (!validation.ok || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveAvatarIdentity(uid, { animalKey, displayName: validation.value });
      onComplete();
    } catch (err) {
      console.warn('[InlineDisplayNameEditor] saveAvatarIdentity failed', err);
      setSaveError(t('shelf.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputBlock}>
        <DisplayNameInput value={value} onChangeText={handleChange} error={error} />
      </View>
      {saveError && (
        <Text
          testID="inline-name-save-error"
          accessibilityLiveRegion="polite"
          style={styles.saveErrorText}
        >
          {saveError}
        </Text>
      )}
      <View style={styles.actions}>
        <PressableSurface
          testID="inline-name-cancel"
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={t('shelf.cancelNameEdit')}
          style={styles.actionButton}
          feedback="standard"
        >
          <Text style={styles.cancelText}>{t('shelf.cancelNameEdit')}</Text>
        </PressableSurface>
        <PressableSurface
          testID="inline-name-save"
          onPress={handleSave}
          disabled={!canSave}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          accessibilityLabel={t('shelf.saveName')}
          style={styles.actionButton}
          feedback="confirming"
        >
          <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>
            {t('shelf.saveName')}
          </Text>
        </PressableSurface>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
    },
    inputBlock: {
      marginBottom: 8,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
    },
    actionButton: {
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    cancelText: {
      fontSize: yomoyoTypography.secondaryActionSize,
      color: colors.secondaryText,
    },
    saveText: {
      fontSize: yomoyoTypography.secondaryActionSize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.primary,
    },
    saveTextDisabled: {
      color: colors.muted,
    },
    saveErrorText: {
      marginBottom: 8,
      fontSize: yomoyoTypography.errorSize,
      color: colors.error,
    },
  });
