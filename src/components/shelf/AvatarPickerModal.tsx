import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import PressableSurface from '@/components/ui/PressableSurface';
import AnimalGridPicker from '@/components/profile/AnimalGridPicker';
import { saveAvatarIdentity } from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';
import { yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

type Props = {
  uid: string;
  displayName: string;
  selectedAnimalKey: AnimalKey;
  visible: boolean;
  onClose: () => void;
};

export default function AvatarPickerModal({
  uid,
  displayName,
  selectedAnimalKey,
  visible,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setIsSaving(false);
      setSaveError(null);
    }
  }, [visible]);

  const handleSelect = async (animalKey: AnimalKey) => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveAvatarIdentity(uid, { animalKey, displayName });
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.warn('[AvatarPickerModal] saveAvatarIdentity failed', err);
      setSaveError(t('shelf.saveError'));
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('shelf.changeAvatar')}</Text>
            <PressableSurface
              testID="avatar-picker-close"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('shelf.closeAvatarPicker')}
              feedback="standard"
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>{t('shelf.closeAvatarPicker')}</Text>
            </PressableSurface>
          </View>
          {saveError && (
            <Text
              testID="avatar-picker-save-error"
              accessibilityLiveRegion="polite"
              style={styles.saveErrorText}
            >
              {saveError}
            </Text>
          )}
          <AnimalGridPicker selected={selectedAnimalKey} onSelect={handleSelect} />
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: yomoyoSpacing.horizontalPadding,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    title: {
      fontSize: yomoyoTypography.headerTitleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
    },
    closeButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    closeText: {
      fontSize: yomoyoTypography.secondaryActionSize,
      color: colors.secondaryText,
    },
    saveErrorText: {
      marginBottom: 8,
      fontSize: yomoyoTypography.errorSize,
      color: colors.error,
    },
  });
