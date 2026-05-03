import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { searchBooks, type Book } from '@/lib/books/searchBooks';
import type { RootStackParamList } from '@/navigation/types';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function is429Error(error: unknown): boolean {
  return error instanceof Error && error.message.includes('429');
}

export default function BookSearchScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
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
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSearch}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t('bookSearch.button')}
        >
          <Text style={styles.buttonText}>{t('bookSearch.button')}</Text>
        </TouchableOpacity>
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
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
            {item.thumbnail ? (
              <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            ) : (
              <View style={styles.thumbnailPlaceholder} />
            )}
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>
                {item.authors.length > 0 ? item.authors.join(', ') : t('bookSearch.unknownAuthor')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: yomoyoColors.background },
  searchRow: { flexDirection: 'row', padding: 16, gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: yomoyoColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: yomoyoTypography.screenBodySize,
  },
  button: {
    backgroundColor: yomoyoColors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: yomoyoColors.surface,
    fontSize: yomoyoTypography.screenBodySize,
    fontWeight: yomoyoTypography.buttonWeight,
  },
  loading: { marginTop: 24 },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    color: yomoyoColors.error,
    fontSize: yomoyoTypography.screenBodySize,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 40,
    color: yomoyoColors.muted,
    fontSize: yomoyoTypography.screenBodySize,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: yomoyoColors.border,
  },
  thumbnail: { width: 50, height: 72, borderRadius: 4, backgroundColor: yomoyoColors.border },
  thumbnailPlaceholder: { width: 50, height: 72, borderRadius: 4, backgroundColor: yomoyoColors.border },
  bookInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  bookTitle: {
    fontSize: 15,
    fontWeight: yomoyoTypography.buttonWeight,
    marginBottom: 4,
    color: yomoyoColors.text,
  },
  bookAuthor: { fontSize: 13, color: yomoyoColors.secondaryText },
});
