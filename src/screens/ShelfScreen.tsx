import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import PressableSurface from '@/components/ui/PressableSurface';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import HeaderIconButton from '@/components/ui/HeaderIconButton';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useTheme, useThemedStyles, type ThemeColors } from '@/lib/theme';
import { useAuth } from '@/hooks/useAuth';
import { subscribeToReadingActivities } from '@/lib/books/readingActivity';
import type { ReadingActivity } from '@/lib/books/readingActivity';
import type { RootStackParamList } from '@/navigation/types';
import MyHandleCard from '@/components/shelf/MyHandleCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ShelfScreen() {
  const { t } = useTranslation();
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderIconButton
          testID="shelf-add-book-button"
          iconName="add"
          color={colors.primary}
          size={26}
          accessibilityLabel={t('shelf.addBook')}
          onPress={() => navigation.navigate('BookSearch')}
        />
      ),
    });
  }, [navigation, t, colors.primary]);

  return (
    <ScreenContainer bottomInset={tabBarInset}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {user?.uid && <MyHandleCard uid={user.uid} />}
        <Text style={styles.sectionHeader}>{t('shelf.finished')}</Text>
        {activities.length === 0 ? (
          <>
            <Text style={styles.emptyText}>{t('shelf.emptyFinished')}</Text>
            <PressableSurface
              style={styles.addButton}
              onPress={() => navigation.navigate('BookSearch')}
              accessibilityRole="button"
              feedback="standard"
            >
              <Text style={styles.addButtonText}>{t('shelf.addBook')}</Text>
            </PressableSurface>
          </>
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
                {item.finishedAt && (
                  <Text style={styles.date}>{item.finishedAt.toDate().toLocaleDateString()}</Text>
                )}
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
    content: {
      paddingTop: 16,
      paddingBottom: 16,
    },
    sectionHeader: {
      fontSize: yomoyoTypography.screenTitleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
      marginBottom: 12,
    },
    emptyText: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.muted,
      marginBottom: 8,
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
      marginBottom: 4,
    },
    date: {
      fontSize: 13,
      color: colors.muted,
    },
    addButton: {
      marginTop: 16,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignSelf: 'flex-start',
    },
    addButtonText: {
      color: colors.surface,
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
  });
