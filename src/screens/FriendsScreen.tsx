import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';

export default function FriendsScreen() {
  const { t } = useTranslation();

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <Text style={styles.title}>{t('friends.emptyTitle')}</Text>
        <Text style={styles.body}>{t('friends.emptyBody')}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: yomoyoTypography.screenTitleSize,
    fontWeight: '700',
    color: yomoyoColors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: yomoyoTypography.screenBodySize,
    lineHeight: yomoyoTypography.screenBodyLineHeight,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
