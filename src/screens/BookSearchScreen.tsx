import React, { useState } from 'react';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BookSearchScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const books = await searchBooks(query.trim());
      setResults(books);
    } catch (error: unknown) {
      console.error('Book search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (book: Book) => {
    navigation.navigate('BookDetail', { book });
  };

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
          style={styles.button}
          onPress={handleSearch}
          accessibilityRole="button"
          accessibilityLabel={t('bookSearch.button')}
        >
          <Text style={styles.buttonText}>{t('bookSearch.button')}</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator style={styles.loading} />}

      {!loading && results !== null && results.length === 0 && (
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
  container: { flex: 1, backgroundColor: '#fff' },
  searchRow: { flexDirection: 'row', padding: 16, gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loading: { marginTop: 24 },
  noResults: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 16 },
  resultItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  thumbnail: { width: 50, height: 72, borderRadius: 4, backgroundColor: '#eee' },
  thumbnailPlaceholder: { width: 50, height: 72, borderRadius: 4, backgroundColor: '#ddd' },
  bookInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  bookTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  bookAuthor: { fontSize: 13, color: '#666' },
});
