import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/lib/i18n';
import ScreenContainer from '@/components/layout/ScreenContainer';
import GlassCard from '@/components/ui/GlassCard';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoColors, yomoyoGlass } from '@/constants/yomoyoTheme';
import { useAuth } from '@/hooks/useAuth';
import { registerPushTokenIfPermitted } from '@/lib/notifications/registerPushToken';

type Language = 'ja' | 'en';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.language.split('-')[0] ?? 'en') as Language;
  const tabBarInset = useGlassTabBarInset();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!user) return;
    Share.share({ message: `yomoyo://user/${user.uid}` })
      .then(() => setCopied(true))
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
        <Text style={styles.sectionLabel}>{t('settings.profileLinkTitle')}</Text>
        <GlassCard>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleCopyLink}
            accessibilityRole="button"
          >
            <Text style={styles.linkButtonText}>{t('settings.copyLink')}</Text>
          </TouchableOpacity>
          {copied && (
            <Text style={styles.linkCopiedText}>{t('settings.linkCopied')}</Text>
          )}
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
  linkButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: yomoyoColors.primary,
  },
  linkCopiedText: {
    fontSize: 13,
    color: yomoyoColors.muted,
    textAlign: 'center',
    paddingBottom: 8,
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
