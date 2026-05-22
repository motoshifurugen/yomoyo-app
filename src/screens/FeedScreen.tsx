import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import PressableSurface from '@/components/ui/PressableSurface';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import ActivityDetailModal from '@/components/feed/ActivityDetailModal';
import ActivityBookmarkButton from '@/components/feed/ActivityBookmarkButton';
import AddFriendButton from '@/components/feed/AddFriendButton';
import TimelineBannerAd from '@/components/ads/TimelineBannerAd';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useTheme, useThemedStyles, type ThemeColors } from '@/lib/theme';
import { ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';
import type { ReadingActivity } from '@/lib/books/readingActivity';
import { useBookmarkFilter } from '@/lib/books/bookmarkFilterContext';
import type { RootStackParamList } from '@/navigation/types';
import { interleaveAds, type FeedRow } from '@/lib/ads/interleaveAds';
import { TIMELINE_AD_CADENCE } from '@/constants/ads';
import { useFeedState } from './FeedScreen.hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ActivityCardProps = {
  item: ReadingActivity;
  bookmarked: boolean;
  onPress: (item: ReadingActivity) => void;
  onToggleBookmark: (activityId: string) => void;
};

const ActivityCard = React.memo(function ActivityCard({
  item,
  bookmarked,
  onPress,
  onToggleBookmark,
}: ActivityCardProps) {
  const styles = useThemedStyles(makeStyles);
  const avatarKey = item.displayAvatar as AnimalKey | undefined;
  const avatarSource = avatarKey && ANIMAL_ASSETS[avatarKey] ? ANIMAL_ASSETS[avatarKey] : null;
  const displayName = item.displayName ?? item.displayLabel;
  const dateText = item.finishedAt ? item.finishedAt.toDate().toLocaleDateString() : null;
  return (
    <View style={styles.cardWrapper}>
      <PressableSurface
        testID={`activity-row-${item.id}`}
        style={styles.card}
        onPress={() => onPress(item)}
        accessibilityRole="button"
        feedback="soft"
      >
        <View style={styles.cardHeader}>
          {avatarSource ? (
            <Image
              source={avatarSource}
              style={styles.avatar}
              accessibilityLabel={displayName ?? undefined}
            />
          ) : (
            <View
              testID={`activity-avatar-placeholder-${item.id}`}
              style={[styles.avatar, styles.avatarPlaceholder]}
            />
          )}
          <View style={styles.cardMeta}>
            <Text style={styles.cardUser}>{displayName ?? '—'}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          {item.thumbnail ? (
            <Image
              testID={`activity-thumbnail-${item.id}`}
              source={{ uri: item.thumbnail }}
              style={styles.thumbnail}
              accessibilityLabel={item.title}
            />
          ) : (
            <View
              testID={`activity-thumbnail-placeholder-${item.id}`}
              style={[styles.thumbnail, styles.thumbnailPlaceholder]}
            />
          )}
          <View testID={`activity-info-${item.id}`} style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {dateText && (
              <Text testID={`activity-date-${item.id}`} style={styles.cardDate}>
                {dateText}
              </Text>
            )}
          </View>
        </View>
      </PressableSurface>
      {/* Sibling of the row PressableSurface — tap isolation depends on this.
          Keep cardHeader.paddingRight ≥ this button's hit area. */}
      <View style={styles.bookmarkSlot} pointerEvents="box-none">
        <ActivityBookmarkButton
          activityId={item.id}
          bookmarked={bookmarked}
          onToggle={onToggleBookmark}
        />
      </View>
    </View>
  );
});

export default function FeedScreen() {
  const { t } = useTranslation();
  const tabBarInset = useGlassTabBarInset();
  const navigation = useNavigation<NavigationProp>();
  const {
    items,
    isLoading,
    isLoadingMore,
    hasError,
    bookmarkedIds,
    handleLoadMore,
    toggleBookmark,
  } = useFeedState();
  const { mode } = useBookmarkFilter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [selectedActivity, setSelectedActivity] = useState<ReadingActivity | null>(null);

  const handleRowPress = useCallback((activity: ReadingActivity) => {
    setSelectedActivity(activity);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedActivity(null);
  }, []);

  const handleViewProfile = useCallback(
    (uid: string) => {
      setSelectedActivity(null);
      navigation.navigate('UserProfile', { uid });
    },
    [navigation],
  );

  const handleToggleBookmark = useCallback(
    (activityId: string) => {
      void toggleBookmark(activityId);
    },
    [toggleBookmark],
  );

  const listData = useMemo<FeedRow<ReadingActivity>[]>(
    () => interleaveAds(items, TIMELINE_AD_CADENCE),
    [items],
  );

  const renderRow = useCallback(
    ({ item: row }: { item: FeedRow<ReadingActivity> }) => {
      if (row.kind === 'ad') {
        return (
          <View style={styles.adSlot}>
            <TimelineBannerAd />
          </View>
        );
      }
      return (
        <ActivityCard
          item={row.item}
          bookmarked={bookmarkedIds.has(row.item.id)}
          onPress={handleRowPress}
          onToggleBookmark={handleToggleBookmark}
        />
      );
    },
    [handleRowPress, handleToggleBookmark, bookmarkedIds, styles.adSlot],
  );

  const keyExtractor = useCallback(
    (row: FeedRow<ReadingActivity>) => (row.kind === 'ad' ? row.key : row.item.id),
    [],
  );

  const renderEmpty = () => {
    if (mode === 'bookmarks') {
      return (
        <View style={styles.center}>
          <Text style={styles.emptyBody}>{t('timeline.emptyBookmarks')}</Text>
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <Text style={styles.emptyBody}>{t('timeline.emptyBody')}</Text>
        <AddFriendButton variant="inline" />
      </View>
    );
  };

  return (
    <ScreenContainer bottomInset={tabBarInset}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : hasError ? (
        <View style={styles.center}>
          <Text style={styles.emptyBody}>{t('timeline.loadErrorBody')}</Text>
        </View>
      ) : items.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          testID="updates-list"
          data={listData}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isLoadingMore ? <ActivityIndicator style={styles.loader} /> : null}
          renderItem={renderRow}
        />
      )}

      <ActivityDetailModal
        activity={selectedActivity}
        visible={selectedActivity !== null}
        onClose={handleClose}
        onViewProfile={handleViewProfile}
      />
    </ScreenContainer>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    emptyBody: {
      fontSize: yomoyoTypography.screenBodySize,
      lineHeight: yomoyoTypography.screenBodyLineHeight,
      color: colors.secondaryText,
      textAlign: 'center',
    },
    list: { paddingBottom: 16 },
    loader: { marginVertical: 16 },
    adSlot: { marginBottom: 12, alignItems: 'center' },
    cardWrapper: {
      position: 'relative',
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    bookmarkSlot: {
      position: 'absolute',
      top: 4,
      right: 4,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      paddingRight: 28,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 10,
    },
    avatarPlaceholder: {
      backgroundColor: colors.border,
    },
    cardMeta: {
      flex: 1,
    },
    cardUser: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.text,
    },
    cardBody: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    cardInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    thumbnail: {
      width: 52,
      height: 72,
      borderRadius: 6,
      marginRight: 12,
    },
    thumbnailPlaceholder: {
      backgroundColor: colors.border,
    },
    cardTitle: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.text,
      marginBottom: 4,
    },
    cardDate: {
      fontSize: 13,
      color: colors.muted,
    },
  });
