import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setLanguage } from '@/lib/i18n';

type Language = 'ja' | 'en';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as Language;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('tabs.settings')}</Text>
      <Text style={styles.sectionTitle}>{t('settings.languageTitle')}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.langButton, currentLanguage === 'ja' && styles.langButtonActive]}
          onPress={() => setLanguage('ja')}
          accessibilityRole="button"
        >
          <Text style={[styles.langText, currentLanguage === 'ja' && styles.langTextActive]}>
            日本語
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langButton, currentLanguage === 'en' && styles.langButtonActive]}
          onPress={() => setLanguage('en')}
          accessibilityRole="button"
        >
          <Text style={[styles.langText, currentLanguage === 'en' && styles.langTextActive]}>
            English
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 32 },
  sectionTitle: { fontSize: 14, color: '#888', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  langButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  langButtonActive: { borderColor: '#4285F4', backgroundColor: '#EBF1FF' },
  langText: { fontSize: 16, color: '#333' },
  langTextActive: { color: '#4285F4', fontWeight: '600' },
});
