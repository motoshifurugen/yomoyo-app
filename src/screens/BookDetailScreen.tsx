import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '@/navigation/types';

type RouteType = RouteProp<RootStackParamList, 'BookDetail'>;

export default function BookDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteType>();
  const { book } = route.params;

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  cover: { width: 120, height: 180, borderRadius: 6, marginBottom: 20, backgroundColor: '#eee' },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  author: { fontSize: 16, color: '#666', textAlign: 'center' },
});
