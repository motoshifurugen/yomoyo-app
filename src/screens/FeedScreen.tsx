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
import AddFriendButton from '@/components/feed/AddFriendButton';
import TimelineBannerAd from '@/components/ads/TimelineBannerAd';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useTheme, useThemedStyles, type ThemeColors } from '@/lib/theme';
import { ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';
import type { ReadingActivity } from '@/lib/books/readingActivity';
import type { RootStackParamList } from '@/navigation/types';
import { interleaveAds, type FeedRow } from '@/lib/ads/interleaveAds';
import { TIMELINE_AD_CADENCE } from '@/constants/ads';
import { useFeedState } from './FeedScreen.hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ActivityCardProps = {
  item: ReadingActivity;
  onPress: (item: ReadingActivity) => void;
};

const ActivityCard = React.memo(function ActivityCard({ item, onPress }: ActivityCardProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const avatarKey = item.displayAvatar as AnimalKey | undefined;
  const avatarSource = avatarKey && ANIMAL_ASSETS[avatarKey] ? ANIMAL_ASSETS[avatarKey] : null;
  const displayName = item.displayName ?? item.displayLabel;
  return (
    <PressableSurface
      testID={`activity-row-${item.id}`}
      style={styles.card}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      feedback="soft"
    >
      <View style={styles.cardHeader}>
        {avatarSource && (
          <Image
            source={avatarSource}
            style={styles.avatar}
            accessibilityLabel={displayName ?? undefined}
          />
        )}
        <View style={styles.cardMeta}>
          <Text style={styles.cardUser}>{displayName ?? '—'}</Text>
          <Text style={styles.cardLabel}>{t('timeline.finishedReading')}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </PressableSurface>
  );
});

export default function FeedScreen() {
  const { t } = useTranslation();
  const tabBarInset = useGlassTabBarInset();
  const navigation = useNavigation<NavigationProp>();
  const { items, isLoading, isLoadingMore, hasError, handleLoadMore } = useFeedState();
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
      return <ActivityCard item={row.item} onPress={handleRowPress} />;
    },
    [handleRowPress, styles.adSlot],
  );

  const keyExtractor = useCallback(
    (row: FeedRow<ReadingActivity>) => (row.kind === 'ad' ? row.key : row.item.id),
    [],
  );

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
        <View style={styles.center}>
          <Text style={styles.emptyBody}>{t('timeline.emptyBody')}</Text>
          <AddFriendButton variant="inline" />
        </View>
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
    list: { padding: 16 },
    loader: { marginVertical: 16 },
    adSlot: { marginBottom: 12, alignItems: 'center' },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 10,
    },
    cardMeta: {
      flex: 1,
    },
    cardUser: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.text,
    },
    cardLabel: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 2,
    },
    cardTitle: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.text,
    },
  });
