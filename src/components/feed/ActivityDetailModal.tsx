import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import PressableSurface from '@/components/ui/PressableSurface';
import { useTranslation } from 'react-i18next';
import DialogCloseButton from '@/components/ui/DialogCloseButton';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';
import { ANIMAL_ASSETS } from '@/lib/users/avatarIdentity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';
import type { ReadingActivity } from '@/lib/books/readingActivity';

type Props = {
  activity: ReadingActivity | null;
  visible: boolean;
  onClose: () => void;
  onViewProfile: (uid: string) => void;
};

export default function ActivityDetailModal({
  activity,
  visible,
  onClose,
  onViewProfile,
}: Props) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);

  if (!activity) return null;

  const avatarKey = activity.displayAvatar as AnimalKey | undefined;
  const avatarSource = avatarKey && ANIMAL_ASSETS[avatarKey] ? ANIMAL_ASSETS[avatarKey] : null;
  const displayName = activity.displayName ?? activity.displayLabel;
  const authorLine =
    activity.authors.length > 0 ? activity.authors.join(', ') : t('bookDetail.unknownAuthor');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <PressableSurface
        testID="activity-detail-modal"
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        feedback="soft"
      >
        {/* Inner Pressable swallows taps so backdrop press does not dismiss when tapping inside the sheet. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {activity.thumbnail ? (
              <Image
                testID="modal-book-thumbnail"
                source={{ uri: activity.thumbnail }}
                style={styles.cover}
                accessibilityLabel={activity.title}
              />
            ) : (
              <View testID="modal-book-thumbnail-placeholder" style={[styles.cover, styles.coverPlaceholder]} />
            )}

            <Text style={styles.title}>{activity.title}</Text>
            <Text style={styles.author}>{authorLine}</Text>

            <View style={styles.divider} />

            <View style={styles.friendBlock}>
              {avatarSource && (
                <Image
                  source={avatarSource}
                  style={styles.avatar}
                  accessibilityLabel={displayName ?? undefined}
                />
              )}
              <View style={styles.friendMeta}>
                <Text style={styles.friendLabel}>{displayName ?? '—'}</Text>
                <Text style={styles.finishedLabel}>{t('timeline.finishedReading')}</Text>
              </View>
            </View>

            <PressableSurface
              testID="modal-view-profile-button"
              style={styles.viewProfileButton}
              onPress={() => onViewProfile(activity.userId)}
              accessibilityRole="button"
              feedback="standard"
            >
              <Text style={styles.viewProfileText}>{t('timeline.modalViewProfile')}</Text>
            </PressableSurface>

            <DialogCloseButton
              testID="modal-close-button"
              label={t('timeline.modalClose')}
              onPress={onClose}
              style={styles.closeButton}
            />
          </ScrollView>
        </Pressable>
      </PressableSurface>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '85%',
    },
    content: {
      padding: 24,
      alignItems: 'center',
    },
    cover: {
      width: 120,
      height: 180,
      borderRadius: 6,
      marginBottom: 16,
      backgroundColor: colors.border,
    },
    coverPlaceholder: {
      backgroundColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 6,
    },
    author: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 20,
    },
    divider: {
      width: '100%',
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 16,
    },
    friendBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'stretch',
      marginBottom: 24,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    friendMeta: {
      flex: 1,
    },
    friendLabel: {
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
      color: colors.text,
    },
    finishedLabel: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    viewProfileButton: {
      alignSelf: 'stretch',
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 10,
    },
    viewProfileText: {
      color: colors.surface,
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
    closeButton: {
      alignSelf: 'stretch',
    },
  });
