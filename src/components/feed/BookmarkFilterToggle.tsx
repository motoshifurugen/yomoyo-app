import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PressableSurface from '@/components/ui/PressableSurface';
import { useTheme } from '@/lib/theme';
import { useBookmarkFilter } from '@/lib/books/bookmarkFilterContext';

export default function BookmarkFilterToggle() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { mode, toggle } = useBookmarkFilter();
  const isBookmarksOnly = mode === 'bookmarks';
  const label = isBookmarksOnly ? t('timeline.filterAll') : t('timeline.filterBookmarks');

  return (
    <PressableSurface
      testID="bookmark-filter-toggle"
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isBookmarksOnly }}
      style={styles.button}
      hitSlop={8}
      feedback="standard"
    >
      <Ionicons
        name={isBookmarksOnly ? 'bookmark' : 'bookmark-outline'}
        size={22}
        color={isBookmarksOnly ? colors.primary : colors.text}
      />
    </PressableSurface>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
