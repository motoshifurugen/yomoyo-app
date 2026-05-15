import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import HeaderIconButton from '@/components/ui/HeaderIconButton';
import { useTheme } from '@/lib/theme';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ShelfAddBookButton() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <HeaderIconButton
      testID="shelf-add-book-button"
      iconName="add"
      color={colors.primary}
      size={26}
      accessibilityLabel={t('shelf.addBook')}
      onPress={() => navigation.navigate('BookSearch')}
    />
  );
}
