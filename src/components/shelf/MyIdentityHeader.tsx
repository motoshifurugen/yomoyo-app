import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import PressableSurface from '@/components/ui/PressableSurface';
import AvatarPickerModal from '@/components/shelf/AvatarPickerModal';
import InlineDisplayNameEditor from '@/components/shelf/InlineDisplayNameEditor';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';
import { getAvatarIdentity, ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AvatarIdentity } from '@/lib/users/avatarIdentity';

const AVATAR_SIZE = 44;

type Props = {
  uid: string;
};

export default function MyIdentityHeader({ uid }: Props) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const [identity, setIdentity] = useState<AvatarIdentity | null>(null);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetchIdentity = useCallback(() => {
    getAvatarIdentity(uid)
      .then((result) => {
        if (!mountedRef.current) return;
        setIdentity(result);
      })
      .catch(() => {
        if (!mountedRef.current) return;
        setIdentity(null);
      });
  }, [uid]);

  useEffect(() => {
    refetchIdentity();
  }, [refetchIdentity]);

  if (!identity) return null;

  return (
    <View testID="my-identity-header" style={styles.container}>
      <PressableSurface
        testID="my-identity-avatar-button"
        onPress={() => setAvatarModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t('shelf.changeAvatar')}
        feedback="standard"
        style={styles.avatarButton}
      >
        <Image
          testID="my-identity-avatar"
          source={ANIMAL_ASSETS[identity.animalKey]}
          style={styles.avatar}
        />
      </PressableSurface>
      <View style={styles.nameBlock}>
        {editingName ? (
          <InlineDisplayNameEditor
            uid={uid}
            initialDisplayName={identity.displayName}
            animalKey={identity.animalKey}
            onComplete={() => {
              setEditingName(false);
              refetchIdentity();
            }}
            onCancel={() => setEditingName(false)}
          />
        ) : (
          <PressableSurface
            testID="my-identity-name-button"
            onPress={() => setEditingName(true)}
            accessibilityRole="button"
            accessibilityLabel={t('shelf.editName')}
            feedback="standard"
            style={styles.nameButton}
          >
            <Text style={styles.displayName} numberOfLines={2}>
              {identity.displayName}
            </Text>
          </PressableSurface>
        )}
      </View>
      <AvatarPickerModal
        uid={uid}
        displayName={identity.displayName}
        selectedAnimalKey={identity.animalKey}
        visible={avatarModalVisible}
        onClose={() => {
          setAvatarModalVisible(false);
          refetchIdentity();
        }}
      />
    </View>
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
    avatarButton: {
      marginRight: 12,
      borderRadius: AVATAR_SIZE / 2,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
    },
    nameBlock: {
      flex: 1,
    },
    nameButton: {
      paddingVertical: 4,
      paddingHorizontal: 0,
    },
    displayName: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.text,
    },
  });
