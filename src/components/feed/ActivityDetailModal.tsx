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
import { useTranslation } from 'react-i18next';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
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
      <Pressable
        testID="activity-detail-modal"
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
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

            <Pressable
              testID="modal-view-profile-button"
              style={styles.viewProfileButton}
              onPress={() => onViewProfile(activity.userId)}
              accessibilityRole="button"
            >
              <Text style={styles.viewProfileText}>{t('timeline.modalViewProfile')}</Text>
            </Pressable>

            <Pressable
              testID="modal-close-button"
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text style={styles.closeText}>{t('timeline.modalClose')}</Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: yomoyoColors.surface,
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
    backgroundColor: yomoyoColors.border,
  },
  coverPlaceholder: {
    backgroundColor: yomoyoColors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: yomoyoTypography.titleWeight,
    color: yomoyoColors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  author: {
    fontSize: yomoyoTypography.screenBodySize,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: yomoyoColors.border,
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
    color: yomoyoColors.text,
  },
  finishedLabel: {
    fontSize: 13,
    color: yomoyoColors.muted,
    marginTop: 2,
  },
  viewProfileButton: {
    alignSelf: 'stretch',
    backgroundColor: yomoyoColors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  viewProfileText: {
    color: yomoyoColors.surface,
    fontSize: yomoyoTypography.screenBodySize,
    fontWeight: yomoyoTypography.buttonWeight,
  },
  closeButton: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeText: {
    color: yomoyoColors.muted,
    fontSize: yomoyoTypography.screenBodySize,
  },
});
