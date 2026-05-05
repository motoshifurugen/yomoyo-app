import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';

export default function AddFriendScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.heading}>{t('addFriend.heading')}</Text>
        <Text style={styles.body}>{t('addFriend.comingSoonBody')}</Text>

        <Pressable
          testID="add-friend-close-button"
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Text style={styles.closeText}>{t('addFriend.close')}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: yomoyoTypography.screenTitleSize,
    fontWeight: yomoyoTypography.titleWeight,
    color: yomoyoColors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: yomoyoTypography.screenBodySize,
    lineHeight: yomoyoTypography.screenBodyLineHeight,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
    marginBottom: 32,
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  closeText: {
    fontSize: yomoyoTypography.screenBodySize,
    color: yomoyoColors.muted,
  },
});
