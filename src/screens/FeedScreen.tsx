import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function FeedScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('tabs.feed')}</Text>
      <TouchableOpacity
        style={styles.button}
        accessibilityRole="button"
        onPress={() => navigation.navigate('BookSearch')}
      >
        <Text style={styles.buttonText}>{t('feed.searchBooks')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 24 },
  button: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#4285F4', borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16 },
});
