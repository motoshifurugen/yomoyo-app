import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/lib/i18n';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { yomoyoColors } from '@/constants/yomoyoTheme';

type Language = 'ja' | 'en';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as Language;

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.sectionLabel}>{t('settings.languageTitle')}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.langOption, currentLanguage === 'ja' && styles.langOptionActive]}
              onPress={() => { void setLanguage('ja'); }}
              accessibilityRole="button"
            >
              <Text style={[styles.langText, currentLanguage === 'ja' && styles.langTextActive]}>
                日本語
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langOption, currentLanguage === 'en' && styles.langOptionActive]}
              onPress={() => { void setLanguage('en'); }}
              accessibilityRole="button"
            >
              <Text style={[styles.langText, currentLanguage === 'en' && styles.langTextActive]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  card: {
    backgroundColor: yomoyoColors.surface,
    borderWidth: 1,
    borderColor: yomoyoColors.border,
    borderRadius: 18,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  langOption: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: yomoyoColors.border,
    backgroundColor: yomoyoColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langOptionActive: {
    borderColor: yomoyoColors.primary,
    backgroundColor: yomoyoColors.selectedBackground,
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
