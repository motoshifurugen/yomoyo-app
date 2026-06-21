import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PressableSurface from '@/components/ui/PressableSurface';
import { useTheme } from '@/lib/theme';
import { useBookmarkFilter } from '@/lib/books/bookmarkFilterContext';

const ICON_SIZE = 18;

export default function BookmarkFilterToggle() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { mode, toggle } = useBookmarkFilter();
  const isBookmarksOnly = mode === 'bookmarks';
  const label = isBookmarksOnly ? t('timeline.filterAll') : t('timeline.filterBookmarks');
  const accent = isBookmarksOnly ? colors.primary : colors.secondaryText;

  return (
    <PressableSurface
      testID="bookmark-filter-toggle"
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isBookmarksOnly }}
      style={[styles.button, isBookmarksOnly && { backgroundColor: colors.selectedBackground }]}
      hitSlop={8}
      feedback="standard"
    >
      <Ionicons
        name={isBookmarksOnly ? 'bookmark' : 'bookmark-outline'}
        size={ICON_SIZE}
        color={accent}
      />
      <Text style={[styles.label, { color: accent }]}>{t('timeline.filterLabel')}</Text>
    </PressableSurface>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
