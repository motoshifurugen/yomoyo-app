import React from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import PressableSurface from '@/components/ui/PressableSurface';
import { useTheme } from '@/lib/theme';

type Props = {
  activityId: string;
  bookmarked: boolean;
  onToggle: (activityId: string) => void;
};

export default function ActivityBookmarkButton({ activityId, bookmarked, onToggle }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const label = bookmarked ? t('timeline.bookmarkRemove') : t('timeline.bookmarkAdd');

  return (
    <PressableSurface
      testID={`bookmark-toggle-${activityId}`}
      onPress={() => onToggle(activityId)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: bookmarked }}
      style={styles.button}
      hitSlop={8}
      feedback="soft"
    >
      <Ionicons
        name={bookmarked ? 'bookmark' : 'bookmark-outline'}
        size={20}
        color={bookmarked ? colors.primary : colors.muted}
      />
    </PressableSurface>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 6,
  },
});
