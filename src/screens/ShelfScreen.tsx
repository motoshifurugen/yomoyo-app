import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToReadingActivities } from '@/lib/books/readingActivity';
import type { ReadingActivity } from '@/lib/books/readingActivity';

export default function ShelfScreen() {
  const { t } = useTranslation();
  const tabBarInset = useGlassTabBarInset();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ReadingActivity[]>([]);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;
    const unsubscribe = subscribeToReadingActivities(uid, setActivities);
    return unsubscribe;
  }, [user?.uid]);

  return (
    <ScreenContainer bottomInset={tabBarInset}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>{t('shelf.finished')}</Text>
        {activities.length === 0 ? (
          <Text style={styles.emptyText}>{t('shelf.emptyFinished')}</Text>
        ) : (
          activities.map((item) => (
            <View key={item.id} style={styles.card}>
              {item.thumbnail ? (
                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.thumbnail}
                  accessibilityLabel={item.title}
                />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
              )}
              <View style={styles.cardInfo}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.author}>{item.authors.join(', ')}</Text>
                {item.finishedAt && (
                  <Text style={styles.date}>{item.finishedAt.toDate().toLocaleDateString()}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    fontSize: yomoyoTypography.screenTitleSize,
    fontWeight: yomoyoTypography.titleWeight,
    color: yomoyoColors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: yomoyoTypography.screenBodySize,
    color: yomoyoColors.muted,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: yomoyoColors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: yomoyoColors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: 52,
    height: 72,
    borderRadius: 6,
    marginRight: 12,
  },
  thumbnailPlaceholder: {
    backgroundColor: yomoyoColors.border,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: yomoyoTypography.screenBodySize,
    fontWeight: yomoyoTypography.buttonWeight,
    color: yomoyoColors.text,
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: yomoyoColors.secondaryText,
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: yomoyoColors.muted,
  },
});
