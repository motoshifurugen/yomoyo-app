import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/lib/i18n';
import ScreenContainer from '@/components/layout/ScreenContainer';
import GlassCard from '@/components/ui/GlassCard';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoColors, yomoyoGlass, yomoyoTypography } from '@/constants/yomoyoTheme';
import { useAuth } from '@/hooks/useAuth';
import { registerPushTokenIfPermitted } from '@/lib/notifications/registerPushToken';
import { getUserHandle } from '@/lib/users/handles';

type Language = 'ja' | 'en';

const SHARED_CONFIRMATION_MS = 2000;

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.language.split('-')[0] ?? 'en') as Language;
  const tabBarInset = useGlassTabBarInset();
  const { user } = useAuth();
  const [handle, setHandle] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserHandle(user.uid)
      .then(setHandle)
      .catch(() => setHandle(null));
  }, [user?.uid]);

  useEffect(() => {
    if (!shared) return;
    const id = setTimeout(() => setShared(false), SHARED_CONFIRMATION_MS);
    return () => clearTimeout(id);
  }, [shared]);

  const handleShare = () => {
    if (!handle) return;
    Share.share({ message: handle })
      .then(() => setShared(true))
      .catch(() => {});
  };

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
    if (user) {
      await registerPushTokenIfPermitted(user.uid);
    }
  };

  return (
    <ScreenContainer bottomInset={tabBarInset}>
      <View style={styles.content}>
        <Text style={styles.sectionLabel}>{t('settings.yourIdTitle')}</Text>
        <GlassCard>
          <View style={styles.idBlock}>
            {handle ? (
              <Text style={styles.handleText}>{handle}</Text>
            ) : (
              <Text style={styles.handlePlaceholder}>—</Text>
            )}
            <TouchableOpacity
              style={[styles.shareButton, !handle && styles.shareButtonDisabled]}
              onPress={handleShare}
              disabled={!handle}
              accessibilityRole="button"
            >
              <Text style={styles.shareButtonText}>{t('settings.shareId')}</Text>
            </TouchableOpacity>
            {shared && <Text style={styles.sharedText}>{t('settings.idShared')}</Text>}
          </View>
        </GlassCard>

        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>{t('settings.languageTitle')}</Text>
        <GlassCard>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.langOption, currentLanguage === 'ja' && styles.langOptionActive]}
              onPress={() => { void handleLanguageChange('ja'); }}
              accessibilityRole="button"
            >
              <Text style={[styles.langText, currentLanguage === 'ja' && styles.langTextActive]}>
                日本語
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langOption, currentLanguage === 'en' && styles.langOptionActive]}
              onPress={() => { void handleLanguageChange('en'); }}
              accessibilityRole="button"
            >
              <Text style={[styles.langText, currentLanguage === 'en' && styles.langTextActive]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: yomoyoColors.secondaryText,
    marginBottom: 12,
  },
  sectionLabelSpaced: {
    marginTop: 24,
  },
  idBlock: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handleText: {
    fontSize: yomoyoTypography.titleSize,
    fontWeight: yomoyoTypography.titleWeight,
    color: yomoyoColors.text,
    marginBottom: 12,
  },
  handlePlaceholder: {
    fontSize: yomoyoTypography.titleSize,
    color: yomoyoColors.muted,
    marginBottom: 12,
  },
  shareButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: yomoyoColors.primary,
  },
  sharedText: {
    fontSize: 13,
    color: yomoyoColors.muted,
    textAlign: 'center',
    paddingTop: 4,
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
});
