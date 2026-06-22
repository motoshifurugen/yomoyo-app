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
        <View style={styles.identityRow}>
          <View style={styles.identityLeft}>
            {user?.uid && <MyIdentityHeader uid={user.uid} />}
          </View>
          <ReadingHistoryHeatmap
            buckets={historyBuckets}
            formatTileLabel={(b) =>
              t('userProfile.history.weekTileLabel', { count: b.count })
            }
          />
        </View>
        {user?.uid && <MyHandleCard uid={user.uid} />}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>{t('shelf.finished')}</Text>
          <Text style={styles.countLine} testID="finished-count">
            {t('shelf.finishedCountInline', { count: activities.length })}
          </Text>
        </View>
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
    identityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    identityLeft: {
      flex: 1,
      marginRight: spacing.md,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: spacing.md,
    },
    sectionHeader: {
      fontSize: yomoyoTypography.screenTitleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
    },
    countLine: {
      fontSize: 14,
      color: colors.secondaryText,
      marginLeft: spacing.xs,
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
