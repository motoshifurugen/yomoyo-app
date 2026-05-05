import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import ActivityDetailModal from '@/components/feed/ActivityDetailModal';
import AddFriendButton from '@/components/feed/AddFriendButton';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
import { ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';
import type { ReadingActivity } from '@/lib/books/readingActivity';
import type { RootStackParamList } from '@/navigation/types';
import { useFeedState } from './FeedScreen.hooks';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type ActivityCardProps = {
  item: ReadingActivity;
  onPress: (item: ReadingActivity) => void;
};

const ActivityCard = React.memo(function ActivityCard({ item, onPress }: ActivityCardProps) {
  const { t } = useTranslation();
  const avatarKey = item.displayAvatar as AnimalKey | undefined;
  const avatarSource = avatarKey && ANIMAL_ASSETS[avatarKey] ? ANIMAL_ASSETS[avatarKey] : null;
  return (
    <Pressable
      testID={`activity-row-${item.id}`}
      style={styles.card}
      onPress={() => onPress(item)}
      accessibilityRole="button"
    >
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
          <Text style={styles.cardLabel}>{t('timeline.finishedReading')}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
    </Pressable>
  );
});

export default function FeedScreen() {
  const { t } = useTranslation();
  const tabBarInset = useGlassTabBarInset();
  const navigation = useNavigation<NavigationProp>();
  const { items, isLoading, isLoadingMore, hasError, handleLoadMore } = useFeedState();

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

  return (
    <ScreenContainer bottomInset={tabBarInset}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={yomoyoColors.primary} />
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
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={isLoadingMore ? <ActivityIndicator style={styles.loader} /> : null}
          renderItem={({ item }) => <ActivityCard item={item} onPress={handleRowPress} />}
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

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
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
});
