import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import HeaderIconButton from '@/components/ui/HeaderIconButton';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Variant = 'icon' | 'inline';

type Props = {
  variant?: Variant;
};

export default function AddFriendButton({ variant = 'icon' }: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);

  const label = t('addFriend.heading');
  const handlePress = () => navigation.navigate('AddFriend');

  if (variant === 'inline') {
    return (
      <Pressable
        testID="add-friend-button-inline"
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.inlineButton}
      >
        <Text style={styles.inlineText}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <HeaderIconButton
      testID="add-friend-button-icon"
      iconName="person-add-outline"
      accessibilityLabel={label}
      onPress={handlePress}
    />
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    inlineButton: {
      marginTop: 16,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    inlineText: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.primary,
    },
  });
