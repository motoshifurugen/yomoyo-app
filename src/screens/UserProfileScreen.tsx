import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import PressableSurface from '@/components/ui/PressableSurface';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarIdentity, ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AvatarIdentity } from '@/lib/users/avatarIdentity';
import { subscribeToReadingActivities } from '@/lib/books/readingActivity';
import type { ReadingActivity } from '@/lib/books/readingActivity';
import { bucketActivitiesByWeek, HISTORY_WINDOW_WEEKS } from '@/lib/books/readingHistory';
import ReadingHistoryHeatmap from '@/components/profile/ReadingHistoryHeatmap';
import BookListItem from '@/components/books/BookListItem';
import BookListSkeleton from '@/components/books/BookListSkeleton';
import { isFollowing, followUser, unfollowUser } from '@/lib/users/follows';
import type { RootStackParamList } from '@/navigation/types';
import { yomoyoTypography, spacing } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Route = RouteProp<RootStackParamList, 'UserProfile'>;

type IdentityState = AvatarIdentity | null | 'loading';

export default function UserProfileScreen() {
  const { params: { uid } } = useRoute<Route>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(makeStyles);

  const [identity, setIdentity] = useState<IdentityState>('loading');
  const [activities, setActivities] = useState<ReadingActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [justFollowed, setJustFollowed] = useState(false);

  const isOwnProfile = user?.uid === uid;

  useEffect(() => {
    getAvatarIdentity(uid)
      .then(setIdentity)
      .catch(() => setIdentity(null));
  }, [uid]);

  useEffect(() => {
    if (!user || isOwnProfile) return;
    isFollowing(user.uid, uid).then(setFollowing).catch(() => {});
  }, [user?.uid, uid, isOwnProfile]);

  useEffect(() => {
    setActivitiesLoading(true);
    const unsubscribe = subscribeToReadingActivities(
      uid,
      (items) => {
        setActivities(items);
        setActivitiesLoading(false);
      },
      () => setActivitiesLoading(false),
    );
    return unsubscribe;
  }, [uid]);

  const historyBuckets = useMemo(
    () => bucketActivitiesByWeek(activities, { weeks: HISTORY_WINDOW_WEEKS }),
    [activities],
  );

  if (identity === 'loading') {
    return (
      <ScreenContainer>
        <ActivityIndicator testID="loading-indicator" />
      </ScreenContainer>
    );
  }

  if (identity === null) {
    return (
      <ScreenContainer>
        <Text style={styles.notFound}>{t('userProfile.notFound')}</Text>
      </ScreenContainer>
    );
  }

  const handleNavBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', undefined);
    }
  };

  const handleFollowToggle = () => {
    if (!user) return;
    if (following) {
      setFollowing(false);
      setJustFollowed(false);
      unfollowUser(user.uid, uid).catch(() => setFollowing(true));
    } else {
      setFollowing(true);
      setJustFollowed(true);
      followUser(user.uid, uid).catch(() => {
        setFollowing(false);
        setJustFollowed(false);
      });
    }
  };

  const handleBackToTimeline = () => {
    navigation.navigate('MainTabs', { screen: 'Timeline' });
  };

  const showFollowSuccess = !isOwnProfile && following && justFollowed;

  return (
    <ScreenContainer>
      <PressableSurface
        style={[styles.navButton, { paddingTop: Math.max(16, insets.top + 4) }]}
        onPress={handleNavBack}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        testID="nav-back-button"
        feedback="standard"
      >
        <Text style={styles.navButtonText}>{'←'}</Text>
      </PressableSurface>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identityBlock}>
          <Image source={ANIMAL_ASSETS[identity.animalKey]} style={styles.avatar} />
          <Text style={styles.displayName}>{identity.displayName}</Text>
        </View>

        <View style={styles.statsBlock}>
          <Text style={styles.countLine} testID="finished-count">
            {t('userProfile.finishedCount', { count: activities.length })}
          </Text>
          <ReadingHistoryHeatmap
            buckets={historyBuckets}
            formatTileLabel={(b) =>
              t('userProfile.history.weekTileLabel', { count: b.count })
            }
          />
        </View>

        {isOwnProfile ? (
          <View style={styles.ownProfileBlock}>
            <Text style={styles.ownPageNote}>{t('userProfile.ownPageNote')}</Text>
            <View style={styles.ownActionsRow}>
              <PressableSurface
                style={styles.shelfButton}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Shelf' })}
                accessibilityRole="button"
                testID="go-to-shelf-button"
                feedback="standard"
              >
                <Text style={styles.shelfButtonText}>{t('tabs.shelf')}</Text>
              </PressableSurface>
            </View>
          </View>
        ) : (
          <>
            {showFollowSuccess && (
              <View testID="follow-success-block" style={styles.successBlock}>
                <Text style={styles.successMessage}>
                  {t('userProfile.followSuccess', { name: identity.displayName })}
                </Text>
                <PressableSurface
                  style={styles.backToTimelineButton}
                  onPress={handleBackToTimeline}
                  accessibilityRole="button"
                  accessibilityLabel={t('userProfile.backToTimeline')}
                  testID="back-to-timeline-button"
                  feedback="confirming"
                >
                  <Text style={styles.backToTimelineText}>
                    {t('userProfile.backToTimeline')}
                  </Text>
                </PressableSurface>
              </View>
            )}
            <PressableSurface
              style={[styles.followButton, following && styles.followButtonActive]}
              onPress={handleFollowToggle}
              accessibilityRole="button"
              testID={following ? 'unfollow-button' : 'follow-button'}
              feedback="confirming"
            >
              <Text style={[styles.followButtonText, following && styles.followButtonTextActive]}>
                {following ? t('userProfile.unfollow') : t('userProfile.follow')}
              </Text>
            </PressableSurface>
          </>
        )}

        <Text style={styles.sectionHeader}>{t('shelf.finished')}</Text>

        {activitiesLoading ? (
          <BookListSkeleton count={3} />
        ) : activities.length === 0 ? (
          <Text style={styles.emptyText}>{t('userProfile.emptyBooks')}</Text>
        ) : (
          activities.map((item) => (
            <BookListItem
              key={item.id}
              title={item.title}
              authors={item.authors}
              thumbnail={item.thumbnail}
            />
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    navButton: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
      marginLeft: spacing.sm,
      alignSelf: 'flex-start',
    },
    navButtonText: {
      fontSize: 22,
      color: colors.text,
    },
    ownProfileBlock: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    ownPageNote: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.secondaryText,
      marginBottom: spacing.lg,
    },
    ownActionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    shelfButton: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: spacing.xl,
    },
    shelfButtonText: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: '500',
      color: colors.text,
    },
    content: {
      paddingTop: spacing.lg,
      paddingBottom: spacing.xl,
    },
    identityBlock: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    statsBlock: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    countLine: {
      fontSize: 14,
      color: colors.secondaryText,
      marginBottom: 10,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      marginBottom: spacing.md,
    },
    displayName: {
      fontSize: yomoyoTypography.screenTitleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
    },
    successBlock: {
      alignSelf: 'stretch',
      marginHorizontal: spacing.xl,
      marginBottom: spacing.lg,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.lg,
      borderRadius: 12,
      backgroundColor: colors.surface,
      alignItems: 'center',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    successMessage: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    backToTimelineButton: {
      borderRadius: 24,
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: spacing.xl,
    },
    backToTimelineText: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: '600',
      color: colors.surface,
    },
    followButton: {
      alignSelf: 'center',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 28,
      marginBottom: spacing.xxl,
    },
    followButtonActive: {
      backgroundColor: colors.primary,
    },
    followButtonText: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: '500',
      color: colors.primary,
    },
    followButtonTextActive: {
      color: colors.surface,
    },
    sectionHeader: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.secondaryText,
      marginBottom: spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    emptyText: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.muted,
    },
    notFound: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.muted,
      textAlign: 'center',
      marginTop: spacing.xxxl,
    },
  });
