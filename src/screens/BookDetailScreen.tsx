import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '@/navigation/types';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';
import { useAuth } from '@/hooks/useAuth';
import { markAsFinished } from '@/lib/books/readingActivity';
import type { Presenter } from '@/lib/books/readingActivity';
import { getAvatarIdentity } from '@/lib/users/avatarIdentity';

type RouteType = RouteProp<RootStackParamList, 'BookDetail'>;

export default function BookDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteType>();
  const { book } = route.params;
  const { user } = useAuth();
  const styles = useThemedStyles(makeStyles);
  const [hasFinished, setHasFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsFinished = async () => {
    if (!user || isLoading || hasFinished) return;
    setIsLoading(true);
    try {
      const avatarIdentity = await getAvatarIdentity(user.uid);
      const presenter: Presenter = avatarIdentity
        ? { displayName: avatarIdentity.displayName, displayAvatar: null }
        : { displayName: user.displayName ?? user.email?.split('@')[0] ?? 'Reader', displayAvatar: user.photoURL ?? null };
      await markAsFinished(user.uid, book, presenter);
      setHasFinished(true);
    } catch {
      // Write failed — button returns to idle so the user can retry
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {book.thumbnail ? (
        <Image
          testID="book-thumbnail"
          source={{ uri: book.thumbnail }}
          style={styles.cover}
        />
      ) : null}
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>
        {book.authors.length > 0 ? book.authors.join(', ') : t('bookDetail.unknownAuthor')}
      </Text>
      <TouchableOpacity
        style={[styles.button, (hasFinished || isLoading) && styles.buttonDone]}
        onPress={handleMarkAsFinished}
        disabled={hasFinished || isLoading}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {hasFinished ? t('shelf.finished') : t('shelf.markAsFinished')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      padding: 24,
      backgroundColor: colors.background,
      flexGrow: 1,
    },
    cover: {
      width: 120,
      height: 180,
      borderRadius: 6,
      marginBottom: 20,
      backgroundColor: colors.border,
    },
    title: {
      fontSize: 22,
      fontWeight: yomoyoTypography.buttonWeight,
      textAlign: 'center',
      marginBottom: 8,
      color: colors.text,
    },
    author: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 32,
    },
    button: {
      backgroundColor: colors.primary,
      height: 52,
      borderRadius: 14,
      paddingHorizontal: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    buttonDone: { backgroundColor: colors.muted },
    buttonText: {
      color: colors.surface,
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
  });
