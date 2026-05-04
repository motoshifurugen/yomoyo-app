import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
import type { RootStackParamList } from '@/navigation/types';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToReadingActivities } from '@/lib/books/readingActivity';
import type { ReadingActivity } from '@/lib/books/readingActivity';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function FeedScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const tabBarInset = useGlassTabBarInset();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ReadingActivity[]>([]);

  const uid = user?.uid ?? null;

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = subscribeToReadingActivities(uid, setActivities);
    return unsubscribe;
  }, [uid]);

  return (
    <ScreenContainer bottomInset={tabBarInset}>
      {activities.length > 0 ? (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>
                {t('feed.finishedReading')}
              </Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.title}>{t('feed.emptyTitle')}</Text>
          <Text style={styles.body}>{t('feed.emptyBody')}</Text>
          <TouchableOpacity
            style={styles.button}
            accessibilityRole="button"
            onPress={() => navigation.navigate('BookSearch')}
          >
            <Text style={styles.buttonText}>{t('feed.searchBooks')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: yomoyoTypography.screenTitleSize,
    fontWeight: yomoyoTypography.titleWeight,
    color: yomoyoColors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: yomoyoTypography.screenBodySize,
    lineHeight: yomoyoTypography.screenBodyLineHeight,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: yomoyoColors.primary,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: yomoyoColors.surface,
    fontSize: yomoyoTypography.secondaryActionSize,
    fontWeight: yomoyoTypography.buttonWeight,
  },
  list: { padding: 16 },
  card: {
    backgroundColor: yomoyoColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: yomoyoColors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    color: yomoyoColors.muted,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: yomoyoTypography.screenBodySize,
    fontWeight: yomoyoTypography.buttonWeight,
    color: yomoyoColors.text,
  },
});
