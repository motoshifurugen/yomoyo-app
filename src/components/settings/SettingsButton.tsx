import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

type Props = {
  onPress: () => void;
};

export default function SettingsButton({ onPress }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Pressable
      testID="settings-button"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('settings.openSettings')}
      style={styles.iconButton}
      hitSlop={8}
    >
      <Ionicons name="settings-outline" size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
