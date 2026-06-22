import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import PressableSurface from '@/components/ui/PressableSurface';
import { useTranslation } from 'react-i18next';
import { signOut } from '@/lib/auth';
import {
  setLanguage,
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
  type Language,
} from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { registerPushTokenIfPermitted } from '@/lib/notifications/registerPushToken';
import {
  useTheme,
  useThemedStyles,
  type ThemeColors,
  type ThemeGlass,
  type ThemeMode,
} from '@/lib/theme';

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

const LANGUAGES: ReadonlyArray<{ code: Language; label: string }> = SUPPORTED_LANGUAGES.map(
  (code) => ({ code, label: LANGUAGE_LABELS[code] }),
);

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
            <PressableSurface
              key={mode}
              testID={`settings-dialog-theme-${mode}`}
              style={[styles.pillOption, active && styles.pillOptionActive]}
              onPress={() => onSelect(mode)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              feedback="standard"
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {t(labelKey)}
              </Text>
            </PressableSurface>
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
            <PressableSurface
              key={code}
              testID={`settings-dialog-lang-${code}`}
              style={[styles.pillOption, active && styles.pillOptionActive]}
              onPress={() => onSelect(code)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              feedback="standard"
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
            </PressableSurface>
          );
        })}
      </View>
    </View>
  );
}

function LogoutSection({
  styles,
  t,
  error,
  onLogout,
}: {
  styles: Styles;
  t: TFn;
  error: string | null;
  onLogout: () => void;
}) {
  return (
    <View>
      {error ? <Text style={styles.logoutError}>{error}</Text> : null}
      <PressableSurface
        testID="settings-dialog-logout"
        style={styles.logoutButton}
        onPress={onLogout}
        accessibilityRole="button"
        feedback="standard"
      >
        <Text style={styles.logoutText}>{t('settings.logout')}</Text>
      </PressableSurface>
    </View>
  );
}

export default function SettingsDialog({ visible, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { mode, setMode } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const currentLanguage = normalizeLanguage(i18n.language);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
    if (user) {
      await registerPushTokenIfPermitted(user.uid);
    }
  };

  const handleLogout = async () => {
    setLogoutError(null);
    try {
      await signOut();
      // On success, useAuth() detects user=null and RootNavigator swaps to the
      // Login screen, unmounting this dialog. No manual navigation needed.
    } catch {
      setLogoutError(t('settings.logoutError'));
    }
  };

  const handleClose = () => {
    setLogoutError(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <PressableSurface
        testID="settings-dialog-backdrop"
        style={styles.backdrop}
        onPress={handleClose}
        accessibilityRole="button"
        feedback="soft"
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
            <LogoutSection styles={styles} t={t} error={logoutError} onLogout={handleLogout} />
          </View>
        </Pressable>
      </PressableSurface>
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
    logoutButton: {
      height: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: glass.border,
      backgroundColor: glass.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.error,
    },
    logoutError: {
      fontSize: 14,
      color: colors.error,
      marginBottom: 12,
      textAlign: 'center',
    },
  });
