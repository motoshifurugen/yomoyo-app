import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { useTranslation } from 'react-i18next';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
import { getUserHandle } from '@/lib/users/handles';

const SHARED_CONFIRMATION_MS = 2000;

type Props = {
  uid: string;
};

export default function MyHandleCard({ uid }: Props) {
  const { t } = useTranslation();
  const [handle, setHandle] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    getUserHandle(uid)
      .then(setHandle)
      .catch(() => setHandle(null));
  }, [uid]);

  useEffect(() => {
    if (!shared) return;
    const id = setTimeout(() => setShared(false), SHARED_CONFIRMATION_MS);
    return () => clearTimeout(id);
  }, [shared]);

  const handleShare = () => {
    if (!handle) return;
    Share.share({ message: handle })
      .then(() => setShared(true))
      .catch(() => {});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('shelf.yourIdTitle')}</Text>
      <View style={styles.row}>
        {handle ? (
          <Text style={styles.handle}>{handle}</Text>
        ) : (
          <Text style={styles.handlePlaceholder}>—</Text>
        )}
        <TouchableOpacity
          style={[styles.shareButton, !handle && styles.shareButtonDisabled]}
          onPress={handleShare}
          disabled={!handle}
          accessibilityRole="button"
        >
          <Text style={styles.shareText}>{t('shelf.shareId')}</Text>
        </TouchableOpacity>
      </View>
      {shared && <Text style={styles.sharedText}>{t('shelf.idShared')}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: yomoyoColors.muted,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  handle: {
    fontSize: yomoyoTypography.screenBodySize,
    fontWeight: yomoyoTypography.buttonWeight,
    color: yomoyoColors.text,
  },
  handlePlaceholder: {
    fontSize: yomoyoTypography.screenBodySize,
    color: yomoyoColors.muted,
  },
  shareButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  shareButtonDisabled: {
    opacity: 0.5,
  },
  shareText: {
    fontSize: 14,
    fontWeight: '500',
    color: yomoyoColors.primary,
  },
  sharedText: {
    fontSize: 12,
    color: yomoyoColors.muted,
    marginTop: 4,
  },
});
