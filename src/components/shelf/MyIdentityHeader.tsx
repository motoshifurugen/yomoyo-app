import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import PressableSurface from '@/components/ui/PressableSurface';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useTheme, useThemedStyles, type ThemeColors } from '@/lib/theme';
import { getAvatarIdentity, ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AvatarIdentity } from '@/lib/users/avatarIdentity';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AVATAR_SIZE = 44;
const EDIT_ICON_SIZE = 14;

type Props = {
  uid: string;
};

export default function MyIdentityHeader({ uid }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [identity, setIdentity] = useState<AvatarIdentity | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAvatarIdentity(uid)
      .then((result) => {
        if (cancelled) return;
        setIdentity(result);
      })
      .catch(() => {
        if (cancelled) return;
        setIdentity(null);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  if (!identity) return null;

  const handlePress = () => navigation.navigate('EditProfile');

  return (
    <PressableSurface
      testID="my-identity-header"
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('userProfile.editProfile')}
      feedback="standard"
    >
      <Image
        testID="my-identity-avatar"
        source={ANIMAL_ASSETS[identity.animalKey]}
        style={styles.avatar}
      />
      <View style={styles.textBlock}>
        <Text style={styles.displayName} numberOfLines={1}>
          {identity.displayName}
        </Text>
      </View>
      <View style={styles.editHintBlock}>
        <Text style={styles.editHintText}>{t('shelf.editHint')}</Text>
        <Ionicons
          name="chevron-forward"
          size={EDIT_ICON_SIZE}
          color={colors.secondaryText}
        />
      </View>
    </PressableSurface>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      marginBottom: 8,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      marginRight: 12,
    },
    textBlock: {
      flex: 1,
    },
    displayName: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.text,
    },
    editHintBlock: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editHintText: {
      fontSize: 13,
      color: colors.secondaryText,
      marginRight: 2,
    },
  });
