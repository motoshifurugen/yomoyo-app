import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarIdentity, ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AvatarIdentity } from '@/lib/users/avatarIdentity';
import { subscribeToReadingActivities } from '@/lib/books/readingActivity';
import type { ReadingActivity } from '@/lib/books/readingActivity';
import { isFollowing, followUser, unfollowUser } from '@/lib/users/follows';
import type { RootStackParamList } from '@/navigation/types';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Route = RouteProp<RootStackParamList, 'UserProfile'>;

type IdentityState = AvatarIdentity | null | 'loading';

export default function UserProfileScreen() {
  const { params: { uid } } = useRoute<Route>();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const styles = useThemedStyles(makeStyles);

  const [identity, setIdentity] = useState<IdentityState>('loading');
  const [activities, setActivities] = useState<ReadingActivity[]>([]);
  const [following, setFollowing] = useState(false);

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
    const unsubscribe = subscribeToReadingActivities(
      uid,
      setActivities,
      () => {},
    );
    return unsubscribe;
  }, [uid]);

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
      unfollowUser(user.uid, uid).catch(() => setFollowing(true));
    } else {
      setFollowing(true);
      followUser(user.uid, uid).catch(() => setFollowing(false));
    }
  };

  return (
    <ScreenContainer>
      <TouchableOpacity
        style={styles.navButton}
        onPress={handleNavBack}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        testID="nav-back-button"
      >
        <Text style={styles.navButtonText}>{'←'}</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.identityBlock}>
          <Image source={ANIMAL_ASSETS[identity.animalKey]} style={styles.avatar} />
          <Text style={styles.displayName}>{identity.displayName}</Text>
        </View>

        {isOwnProfile ? (
          <View style={styles.ownProfileBlock}>
            <Text style={styles.ownPageNote}>{t('userProfile.ownPageNote')}</Text>
            <View style={styles.ownActionsRow}>
              <TouchableOpacity
                style={styles.shelfButton}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Shelf' })}
                accessibilityRole="button"
                testID="go-to-shelf-button"
              >
                <Text style={styles.shelfButtonText}>{t('tabs.shelf')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shelfButton}
                onPress={() => navigation.navigate('EditProfile')}
                accessibilityRole="button"
                testID="edit-profile-button"
              >
                <Text style={styles.shelfButtonText}>{t('userProfile.editProfile')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.followButton, following && styles.followButtonActive]}
            onPress={handleFollowToggle}
            accessibilityRole="button"
            testID={following ? 'unfollow-button' : 'follow-button'}
          >
            <Text style={[styles.followButtonText, following && styles.followButtonTextActive]}>
              {following ? t('userProfile.unfollow') : t('userProfile.follow')}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionHeader}>{t('shelf.finished')}</Text>

        {activities.length === 0 ? (
          <Text style={styles.emptyText}>{t('userProfile.emptyBooks')}</Text>
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
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    navButton: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      alignSelf: 'flex-start',
    },
    navButtonText: {
      fontSize: 22,
      color: colors.text,
    },
    ownProfileBlock: {
      alignItems: 'center',
      marginBottom: 32,
    },
    ownPageNote: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.secondaryText,
      marginBottom: 16,
    },
    ownActionsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    shelfButton: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 24,
    },
    shelfButtonText: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: '500',
      color: colors.text,
    },
    content: {
      paddingTop: 16,
      paddingBottom: 24,
    },
    identityBlock: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      marginBottom: 12,
    },
    displayName: {
      fontSize: yomoyoTypography.screenTitleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
    },
    followButton: {
      alignSelf: 'center',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 28,
      marginBottom: 32,
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
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    emptyText: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.muted,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      shadowColor: colors.text,
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
      backgroundColor: colors.border,
    },
    cardInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    bookTitle: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.text,
      marginBottom: 4,
    },
    author: {
      fontSize: 14,
      color: colors.secondaryText,
    },
    notFound: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 48,
    },
  });
