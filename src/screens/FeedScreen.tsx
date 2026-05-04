import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
import { ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';
import type { ReadingActivity } from '@/lib/books/readingActivity';
import { useFeedState } from './FeedScreen.hooks';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type TimelineCardProps = {
  item: ReadingActivity;
  isFollowing: boolean;
  isSelf: boolean;
  showAction: boolean;
  onFollow: (uid: string) => void;
  onUnfollow: (uid: string) => void;
};

const TimelineCard = React.memo(function TimelineCard({
  item,
  isFollowing,
  isSelf,
  showAction,
  onFollow,
  onUnfollow,
}: TimelineCardProps) {
  const { t } = useTranslation();
  const avatarKey = item.displayAvatar as AnimalKey | undefined;
  const avatarSource = avatarKey && ANIMAL_ASSETS[avatarKey] ? ANIMAL_ASSETS[avatarKey] : null;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {avatarSource && (
          <Image
            source={avatarSource}
            style={styles.avatar}
            accessibilityLabel={item.displayLabel ?? undefined}
          />
        )}
        <View style={styles.cardMeta}>
          <Text style={styles.cardUser}>{item.displayLabel ?? '—'}</Text>
          <Text style={styles.cardLabel}>{t('feed.finishedReading')}</Text>
        </View>
        {showAction && !isSelf && (
          <TouchableOpacity
            testID={isFollowing ? `unfollow-${item.userId}` : `follow-${item.userId}`}
            style={[styles.actionButton, isFollowing && styles.receivingButton]}
            onPress={() => (isFollowing ? onUnfollow(item.userId) : onFollow(item.userId))}
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, isFollowing && styles.receivingButtonText]}>
              {isFollowing ? t('friends.following') : t('friends.follow')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </View>
  );
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function FeedScreen() {
  const { t } = useTranslation();
  const tabBarInset = useGlassTabBarInset();
  const {
    activeTab,
    handleTabChange,
    timelineItems,
    isLoadingTimeline,
    isLoadingMore,
    timelineError,
    handleLoadMoreTimeline,
    followingUids,
    handleFollow,
    handleUnfollow,
    updatesItems,
    isLoadingUpdates,
    updatesError,
    isLoadingUpdatesMore,
    handleLoadMoreUpdates,
    currentUid,
  } = useFeedState();

  return (
    <ScreenContainer bottomInset={tabBarInset}>
      <View style={styles.toggleBar} accessibilityRole="tablist">
        <TouchableOpacity
          testID="tab-timeline"
          style={[styles.toggleButton, activeTab === 'timeline' && styles.toggleButtonActive]}
          onPress={() => handleTabChange('timeline')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'timeline' }}
        >
          <Text style={[styles.toggleText, activeTab === 'timeline' && styles.toggleTextActive]}>
            {t('friends.timelineTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="tab-updates"
          style={[styles.toggleButton, activeTab === 'updates' && styles.toggleButtonActive]}
          onPress={() => handleTabChange('updates')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'updates' }}
        >
          <Text style={[styles.toggleText, activeTab === 'updates' && styles.toggleTextActive]}>
            {t('friends.updatesTab')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'timeline' ? (
        isLoadingTimeline ? (
          <View style={styles.center}>
            <ActivityIndicator color={yomoyoColors.primary} />
          </View>
        ) : timelineError ? (
          <View style={styles.center}>
            <Text style={styles.emptyBody}>{t('friends.loadErrorBody')}</Text>
          </View>
        ) : timelineItems.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>{t('friends.timelineEmptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('friends.timelineEmptyBody')}</Text>
          </View>
        ) : (
          <FlatList
            testID="timeline-list"
            data={timelineItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            onEndReached={handleLoadMoreTimeline}
            onEndReachedThreshold={0.3}
            ListFooterComponent={isLoadingMore ? <ActivityIndicator style={styles.loader} /> : null}
            renderItem={({ item }) => (
              <TimelineCard
                item={item}
                isFollowing={followingUids.has(item.userId)}
                isSelf={item.userId === currentUid}
                showAction={true}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
              />
            )}
          />
        )
      ) : isLoadingUpdates ? (
        <View style={styles.center}>
          <ActivityIndicator color={yomoyoColors.primary} />
        </View>
      ) : updatesError ? (
        <View style={styles.center}>
          <Text style={styles.emptyBody}>{t('friends.loadErrorBody')}</Text>
        </View>
      ) : updatesItems.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>{t('friends.updatesEmptyTitle')}</Text>
          <Text style={styles.emptyBody}>{t('friends.updatesEmptyBody')}</Text>
        </View>
      ) : (
        <FlatList
          testID="updates-list"
          data={updatesItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMoreUpdates}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingUpdatesMore ? <ActivityIndicator style={styles.loader} /> : null
          }
          renderItem={({ item }) => (
            <TimelineCard
              item={item}
              isFollowing={true}
              isSelf={item.userId === currentUid}
              showAction={false}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  toggleBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: yomoyoColors.border,
    borderRadius: 10,
    padding: 3,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: yomoyoColors.surface,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: yomoyoColors.secondaryText,
  },
  toggleTextActive: {
    color: yomoyoColors.text,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: yomoyoTypography.screenTitleSize,
    fontWeight: yomoyoTypography.titleWeight,
    color: yomoyoColors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyBody: {
    fontSize: yomoyoTypography.screenBodySize,
    lineHeight: yomoyoTypography.screenBodyLineHeight,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
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
    color: yomoyoColors.text,
  },
  cardLabel: {
    fontSize: 12,
    color: yomoyoColors.muted,
    marginTop: 2,
  },
  cardTitle: {
    fontSize: yomoyoTypography.screenBodySize,
    fontWeight: yomoyoTypography.buttonWeight,
    color: yomoyoColors.text,
  },
  actionButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: yomoyoColors.primary,
  },
  receivingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: yomoyoColors.border,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: yomoyoColors.surface,
  },
  receivingButtonText: {
    color: yomoyoColors.muted,
  },
});
