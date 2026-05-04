import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
import type { RootStackParamList } from '@/navigation/types';
import { useAuth } from '@/hooks/useAuth';
import { getFollowingUids } from '@/lib/users/follows';
import { getFriendsFeed } from '@/lib/books/friendsFeed';
import type { ReadingActivity } from '@/lib/books/readingActivity';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function FeedScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const tabBarInset = useGlassTabBarInset();
  const { user } = useAuth();

  const [followingUids, setFollowingUids] = useState<string[]>([]);
  const [items, setItems] = useState<ReadingActivity[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    getFollowingUids(user.uid)
      .then((uids) => {
        setFollowingUids(uids);
        if (uids.length === 0) return null;
        return getFriendsFeed(uids, null);
      })
      .then((page) => {
        if (!page) return;
        setItems(page.items);
        setLastDoc(page.lastDoc);
      })
      .catch(() => {
        // Network or permission error — feed stays empty
      });
  }, [user?.uid]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !lastDoc || followingUids.length === 0) return;
    setIsLoadingMore(true);
    getFriendsFeed(followingUids, lastDoc)
      .then((page) => {
        setItems((prev) => [...prev, ...page.items]);
        setLastDoc(page.lastDoc);
      })
      .catch(() => {
        // Network error — user can retry by scrolling again
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [isLoadingMore, lastDoc, followingUids]);

  return (
    <ScreenContainer bottomInset={tabBarInset}>
      {items.length > 0 ? (
        <FlatList
          testID="friends-feed-list"
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isLoadingMore ? <ActivityIndicator style={styles.loader} /> : null}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardUser}>{item.displayLabel ?? 'Someone'}</Text>
              <Text style={styles.cardLabel}>{t('feed.finishedReading')}</Text>
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
  loader: { marginVertical: 16 },
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
  cardUser: {
    fontSize: yomoyoTypography.screenBodySize,
    fontWeight: yomoyoTypography.buttonWeight,
    color: yomoyoColors.text,
    marginBottom: 2,
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
