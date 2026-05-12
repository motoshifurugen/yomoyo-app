import React from 'react';
import { Modal, View, Text, Pressable, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { registerPushTokenIfPermitted } from '@/lib/notifications/registerPushToken';
import DialogCloseButton from '@/components/ui/DialogCloseButton';
import {
  useTheme,
  useThemedStyles,
  type ThemeColors,
  type ThemeGlass,
  type ThemeMode,
} from '@/lib/theme';

type Language = 'ja' | 'en';

type Props = {
  visible: boolean;
  onClose: () => void;
};

type Styles = ReturnType<typeof makeStyles>;

const THEME_MODES: ReadonlyArray<{ mode: ThemeMode; labelKey: string }> = [
  { mode: 'light', labelKey: 'settings.themeLight' },
  { mode: 'dark', labelKey: 'settings.themeDark' },
  { mode: 'system', labelKey: 'settings.themeSystem' },
];

const LANGUAGES: ReadonlyArray<{ code: Language; label: string }> = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
];

type TFn = (key: string) => string;

function ThemeSection({
  styles,
  t,
  current,
  onSelect,
}: {
  styles: Styles;
  t: TFn;
  current: ThemeMode;
  onSelect: (next: ThemeMode) => void;
}) {
  return (
    <View>
      <Text style={styles.sectionLabel}>{t('settings.themeTitle')}</Text>
      <View style={styles.row}>
        {THEME_MODES.map(({ mode, labelKey }) => {
          const active = current === mode;
          return (
            <TouchableOpacity
              key={mode}
              testID={`settings-dialog-theme-${mode}`}
              style={[styles.pillOption, active && styles.pillOptionActive]}
              onPress={() => onSelect(mode)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {t(labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function LanguageSection({
  styles,
  t,
  current,
  onSelect,
}: {
  styles: Styles;
  t: TFn;
  current: Language;
  onSelect: (next: Language) => void;
}) {
  return (
    <View>
      <Text style={styles.sectionLabel}>{t('settings.languageTitle')}</Text>
      <View style={styles.row}>
        {LANGUAGES.map(({ code, label }) => {
          const active = current === code;
          return (
            <TouchableOpacity
              key={code}
              testID={`settings-dialog-lang-${code}`}
              style={[styles.pillOption, active && styles.pillOptionActive]}
              onPress={() => onSelect(code)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function SettingsDialog({ visible, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { mode, setMode } = useTheme();
  const styles = useThemedStyles(makeStyles);
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
          <View style={styles.sections}>
            <ThemeSection styles={styles} t={t} current={mode} onSelect={setMode} />
            <LanguageSection
              styles={styles}
              t={t}
              current={currentLanguage}
              onSelect={handleLanguageChange}
            />
          </View>
          <DialogCloseButton
            testID="settings-dialog-close"
            label={t('settings.close')}
            onPress={onClose}
            style={styles.closeButton}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors, glass: ThemeGlass) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    sheet: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
    },
    sections: {
      gap: 20,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.secondaryText,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    pillOption: {
      flex: 1,
      height: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: glass.border,
      backgroundColor: glass.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillOptionActive: {
      borderColor: colors.primary,
      backgroundColor: glass.tealTint,
    },
    pillText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    pillTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    closeButton: {
      marginTop: 16,
    },
  });
