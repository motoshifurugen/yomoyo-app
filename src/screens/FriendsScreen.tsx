import React, { useEffect, useState, useCallback } from 'react';
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
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
import { useAuth } from '@/hooks/useAuth';
import {
  followUser,
  unfollowUser,
  getFollowingUids,
  getFollowingProfiles,
} from '@/lib/users/follows';
import type { UserProfile } from '@/lib/users/follows';
import { getTimeline } from '@/lib/books/timeline';
import type { ReadingActivity } from '@/lib/books/readingActivity';
import { ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type TimelineCardProps = {
  item: ReadingActivity;
  isFollowing: boolean;
  isSelf: boolean;
  onFollow: (uid: string) => void;
  onUnfollow: (uid: string) => void;
};

const TimelineCard = React.memo(function TimelineCard({
  item,
  isFollowing,
  isSelf,
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
        {!isSelf && (
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

type FriendRowProps = {
  item: UserProfile;
  onUnfollow: (uid: string) => void;
};

const FriendRow = React.memo(function FriendRow({ item, onUnfollow }: FriendRowProps) {
  const { t } = useTranslation();
  const avatarKey = item.animalKey as AnimalKey | undefined;
  const avatarSource = avatarKey && ANIMAL_ASSETS[avatarKey] ? ANIMAL_ASSETS[avatarKey] : null;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {avatarSource && (
          <Image
            source={avatarSource}
            style={styles.avatar}
            accessibilityLabel={item.displayLabel}
          />
        )}
        <Text style={[styles.cardUser, styles.friendName]}>{item.displayLabel}</Text>
        <TouchableOpacity
          testID={`unfollow-friend-${item.uid}`}
          style={styles.stopButton}
          onPress={() => onUnfollow(item.uid)}
          accessibilityRole="button"
        >
          <Text style={styles.stopButtonText}>{t('friends.unfollow')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

type ActiveTab = 'timeline' | 'updates';

export default function FriendsScreen() {
  const { t } = useTranslation();
  const tabBarInset = useGlassTabBarInset();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');
  const [timelineItems, setTimelineItems] = useState<ReadingActivity[]>([]);
  const [timelineLastDoc, setTimelineLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [followingUids, setFollowingUids] = useState<Set<string>>(new Set());
  const [updatesProfiles, setUpdatesProfiles] = useState<UserProfile[]>([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const [updatesLoaded, setUpdatesLoaded] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    setIsLoadingTimeline(true);
    Promise.all([getTimeline(null), getFollowingUids(user.uid)])
      .then(([page, uids]) => {
        setTimelineItems(page.items);
        setTimelineLastDoc(page.lastDoc);
        setFollowingUids(new Set(uids));
      })
      .catch(() => {
        // Network or permission error — surfaces stay empty
      })
      .finally(() => setIsLoadingTimeline(false));
  }, [user?.uid]);

  const loadUpdates = useCallback(() => {
    if (!user?.uid || updatesLoaded || isLoadingUpdates) return;
    setIsLoadingUpdates(true);
    getFollowingProfiles(user.uid)
      .then((profiles) => {
        setUpdatesProfiles(profiles);
        setUpdatesLoaded(true);
      })
      .catch(() => {
        // Network error — updates list stays empty
      })
      .finally(() => setIsLoadingUpdates(false));
  }, [user?.uid, updatesLoaded, isLoadingUpdates]);

  const handleTabChange = useCallback(
    (tab: ActiveTab) => {
      setActiveTab(tab);
      if (tab === 'updates') loadUpdates();
    },
    [loadUpdates],
  );

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !timelineLastDoc) return;
    setIsLoadingMore(true);
    getTimeline(timelineLastDoc)
      .then((page) => {
        setTimelineItems((prev) => [...prev, ...page.items]);
        setTimelineLastDoc(page.lastDoc);
      })
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  }, [isLoadingMore, timelineLastDoc]);

  const handleFollow = useCallback(
    (targetUid: string) => {
      if (!user?.uid || user.uid === targetUid) return;
      setFollowingUids((prev) => new Set([...prev, targetUid]));
      setUpdatesLoaded(false);
      followUser(user.uid, targetUid).catch(() => {
        setFollowingUids((prev) => {
          const next = new Set(prev);
          next.delete(targetUid);
          return next;
        });
      });
    },
    [user?.uid],
  );

  const handleUnfollow = useCallback(
    (targetUid: string) => {
      if (!user?.uid) return;
      setFollowingUids((prev) => {
        const next = new Set(prev);
        next.delete(targetUid);
        return next;
      });
      setUpdatesProfiles((prev) => prev.filter((p) => p.uid !== targetUid));
      setUpdatesLoaded(false);
      unfollowUser(user.uid, targetUid).catch(() => {
        setFollowingUids((prev) => new Set([...prev, targetUid]));
        setUpdatesLoaded(false);
      });
    },
    [user?.uid],
  );

  const currentUid = user?.uid ?? '';

  return (
    <ScreenContainer bottomInset={tabBarInset}>
      <View style={styles.toggleBar}>
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
          testID="tab-friends"
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
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={isLoadingMore ? <ActivityIndicator style={styles.loader} /> : null}
            renderItem={({ item }) => (
              <TimelineCard
                item={item}
                isFollowing={followingUids.has(item.userId)}
                isSelf={item.userId === currentUid}
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
      ) : updatesProfiles.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>{t('friends.updatesEmptyTitle')}</Text>
          <Text style={styles.emptyBody}>{t('friends.updatesEmptyBody')}</Text>
        </View>
      ) : (
        <FlatList
          testID="friends-list"
          data={updatesProfiles}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <FriendRow item={item} onUnfollow={handleUnfollow} />
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
  friendName: {
    flex: 1,
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
  stopButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: yomoyoColors.border,
  },
  stopButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: yomoyoColors.secondaryText,
  },
});
