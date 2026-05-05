import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
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
    <Pressable
      testID="add-friend-button-icon"
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.iconButton}
      hitSlop={8}
    >
      <Ionicons name="person-add-outline" size={22} color={yomoyoColors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inlineButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: yomoyoColors.primary,
  },
  inlineText: {
    fontSize: yomoyoTypography.screenBodySize,
    fontWeight: yomoyoTypography.buttonWeight,
    color: yomoyoColors.primary,
  },
});
