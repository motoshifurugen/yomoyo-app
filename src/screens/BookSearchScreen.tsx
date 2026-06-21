import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableSurface from '@/components/ui/PressableSurface';
import BookListItem from '@/components/books/BookListItem';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { searchBooks, type Book } from '@/lib/books/searchBooks';
import type { RootStackParamList } from '@/navigation/types';
import { yomoyoTypography, spacing } from '@/constants/yomoyoTheme';
import { useThemedStyles, useTheme, type ThemeColors } from '@/lib/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function is429Error(error: unknown): boolean {
  return error instanceof Error && error.message.includes('429');
}

export default function BookSearchScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<'rateLimit' | 'generic' | null>(null);

  const isSearchingRef = useRef(false);

  const handleSearch = async () => {
    if (!query.trim() || isSearchingRef.current) return;
    isSearchingRef.current = true;
    setLoading(true);
    setSearchError(null);
    try {
      const books = await searchBooks(query.trim());
      setResults(books);
    } catch (error: unknown) {
      setSearchError(is429Error(error) ? 'rateLimit' : 'generic');
      setResults(null);
    } finally {
      isSearchingRef.current = false;
      setLoading(false);
    }
  };

  const handleSelect = (book: Book) => {
    navigation.navigate('BookDetail', { book });
  };

  const errorKey = searchError === 'rateLimit'
    ? 'bookSearch.rateLimitError'
    : 'bookSearch.searchError';

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder={t('bookSearch.placeholder')}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <PressableSurface
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSearch}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t('bookSearch.button')}
          feedback="standard"
        >
          <Text style={styles.buttonText}>{t('bookSearch.button')}</Text>
        </PressableSurface>
        <PressableSurface
          style={styles.scanButton}
          onPress={() => navigation.navigate('BarcodeScan')}
          accessibilityRole="button"
          accessibilityLabel={t('bookSearch.scanBarcode')}
          feedback="standard"
        >
          <Ionicons name="barcode-outline" size={22} color={colors.surface} />
        </PressableSurface>
      </View>

      {loading && <ActivityIndicator style={styles.loading} />}

      {!loading && searchError && (
        <Text style={styles.errorText}>{t(errorKey)}</Text>
      )}

      {!loading && !searchError && results !== null && results.length === 0 && (
        <Text style={styles.noResults}>{t('bookSearch.noResults')}</Text>
      )}

      <FlatList
        data={results ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <BookListItem
            title={item.title}
            authors={item.authors}
            thumbnail={item.thumbnail}
            onPress={() => handleSelect(item)}
            unknownAuthorLabel={t('bookSearch.unknownAuthor')}
          />
        )}
      />
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    searchRow: { flexDirection: 'row', padding: spacing.lg, gap: spacing.sm },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      fontSize: yomoyoTypography.screenBodySize,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: spacing.lg,
      justifyContent: 'center',
    },
    scanButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: colors.surface,
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
    loading: { marginTop: spacing.xl },
    errorText: {
      textAlign: 'center',
      marginTop: 40,
      color: colors.error,
      fontSize: yomoyoTypography.screenBodySize,
    },
    noResults: {
      textAlign: 'center',
      marginTop: 40,
      color: colors.muted,
      fontSize: yomoyoTypography.screenBodySize,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
  });
