import React from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { registerPushTokenIfPermitted } from '@/lib/notifications/registerPushToken';
import { yomoyoColors, yomoyoGlass, yomoyoTypography } from '@/constants/yomoyoTheme';

type Language = 'ja' | 'en';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function SettingsDialog({ visible, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const currentLanguage = (i18n.language.split('-')[0] ?? 'en') as Language;

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
    if (user) {
      await registerPushTokenIfPermitted(user.uid);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        testID="settings-dialog-backdrop"
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
      >
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.sectionLabel}>{t('settings.languageTitle')}</Text>
          <View style={styles.row}>
            <TouchableOpacity
              testID="settings-dialog-lang-ja"
              style={[styles.langOption, currentLanguage === 'ja' && styles.langOptionActive]}
              onPress={() => {
                void handleLanguageChange('ja');
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: currentLanguage === 'ja' }}
            >
              <Text style={[styles.langText, currentLanguage === 'ja' && styles.langTextActive]}>
                日本語
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="settings-dialog-lang-en"
              style={[styles.langOption, currentLanguage === 'en' && styles.langOptionActive]}
              onPress={() => {
                void handleLanguageChange('en');
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: currentLanguage === 'en' }}
            >
              <Text style={[styles.langText, currentLanguage === 'en' && styles.langTextActive]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            testID="settings-dialog-close"
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.closeText}>{t('settings.close')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: yomoyoColors.surface,
    borderRadius: 20,
    padding: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: yomoyoColors.secondaryText,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  langOption: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: yomoyoGlass.border,
    backgroundColor: yomoyoGlass.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langOptionActive: {
    borderColor: yomoyoColors.primary,
    backgroundColor: yomoyoGlass.tealTint,
  },
  langText: {
    fontSize: 16,
    fontWeight: '500',
    color: yomoyoColors.text,
  },
  langTextActive: {
    color: yomoyoColors.primary,
    fontWeight: '600',
  },
  closeButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  closeText: {
    fontSize: yomoyoTypography.screenBodySize,
    color: yomoyoColors.muted,
  },
});
