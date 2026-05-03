import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenContainer from '@/components/layout/ScreenContainer';
import { useGlassTabBarInset } from '@/components/ui/GlassTabBar';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
import type { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function FeedScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const tabBarInset = useGlassTabBarInset();

  return (
    <ScreenContainer bottomInset={tabBarInset}>
      <View style={styles.center}>
        <Text style={styles.title}>{t('feed.emptyTitle')}</Text>
        <Text style={styles.body}>{t('feed.emptyBody')}</Text>
        <TouchableOpacity
          style={styles.button}
          accessibilityRole="button"
          onPress={() => navigation.navigate('BookSearch')}
        >
          <Text style={styles.buttonText}>{t('feed.searchBooks')}</Text>
        </TouchableOpacity>
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
    fontWeight: yomoyoTypography.titleWeight,
    color: yomoyoColors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: yomoyoTypography.screenBodySize,
    lineHeight: yomoyoTypography.screenBodyLineHeight,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: yomoyoColors.primary,
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: yomoyoColors.surface,
    fontSize: yomoyoTypography.secondaryActionSize,
    fontWeight: yomoyoTypography.buttonWeight,
  },
});
