import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableSurface from '@/components/ui/PressableSurface';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoTypography, spacing } from '@/constants/yomoyoTheme';
import { useTheme, useThemedStyles, type ThemeColors } from '@/lib/theme';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToReadingActivities } from '@/lib/books/readingActivity';
import type { ReadingActivity } from '@/lib/books/readingActivity';
import { bucketActivitiesByWeek, HISTORY_WINDOW_WEEKS } from '@/lib/books/readingHistory';
import ReadingHistoryHeatmap from '@/components/profile/ReadingHistoryHeatmap';
import type { RootStackParamList } from '@/navigation/types';
import MyHandleCard from '@/components/shelf/MyHandleCard';
import MyIdentityHeader from '@/components/shelf/MyIdentityHeader';
import BookListItem from '@/components/books/BookListItem';
import EmptyState from '@/components/ui/EmptyState';
import { formatBookDate } from '@/lib/books/formatBookDate';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CTA_ICON_SIZE = 20;
const CTA_GAP_ABOVE_TAB_BAR = 12;

export default function ShelfScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const tabBarInset = useGlassTabBarInset();
  const { user } = useAuth();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [activities, setActivities] = useState<ReadingActivity[]>([]);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) return;
    const unsubscribe = subscribeToReadingActivities(uid, setActivities);
    return unsubscribe;
  }, [user?.uid]);

  const historyBuckets = useMemo(
    () => bucketActivitiesByWeek(activities, { weeks: HISTORY_WINDOW_WEEKS }),
    [activities],
  );

  const handleAddBook = () => navigation.navigate('BookSearch');

  return (
    <ScreenContainer>
      <View style={styles.fixedHeader}>
        {user?.uid && <MyIdentityHeader uid={user.uid} />}
        {user?.uid && <MyHandleCard uid={user.uid} />}
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
        <Text style={styles.sectionHeader}>{t('shelf.finished')}</Text>
      </View>
      <ScrollView
        testID="shelf-books-scroll"
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activities.length === 0 ? (
          <EmptyState
            icon="book-outline"
            title={t('shelf.emptyTitle')}
            message={t('shelf.emptyFinished')}
          />
        ) : (
          activities.map((item) => (
            <BookListItem
              key={item.id}
              title={item.title}
              authors={item.authors}
              thumbnail={item.thumbnail}
              date={
                item.finishedAt
                  ? formatBookDate(item.finishedAt.toDate(), i18n.language)
                  : undefined
              }
            />
          ))
        )}
      </ScrollView>
      <PressableSurface
        testID="shelf-add-book-button"
        style={[styles.cta, { marginBottom: tabBarInset + CTA_GAP_ABOVE_TAB_BAR }]}
        onPress={handleAddBook}
        accessibilityRole="button"
        accessibilityLabel={t('shelf.addBook')}
        feedback="standard"
      >
        <Ionicons name="add" size={CTA_ICON_SIZE} color={colors.surface} />
        <Text style={styles.ctaText}>{t('shelf.addBook')}</Text>
      </PressableSurface>
    </ScreenContainer>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    fixedHeader: {
      paddingTop: spacing.lg,
    },
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingBottom: spacing.lg,
    },
    statsBlock: {
      alignItems: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    countLine: {
      fontSize: 14,
      color: colors.secondaryText,
      marginBottom: 10,
    },
    sectionHeader: {
      fontSize: yomoyoTypography.screenTitleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
      marginBottom: spacing.md,
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 20,
      gap: spacing.sm,
    },
    ctaText: {
      color: colors.surface,
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
  });
