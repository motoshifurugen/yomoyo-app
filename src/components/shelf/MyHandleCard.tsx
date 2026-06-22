import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import PressableSurface from '@/components/ui/PressableSurface';
import { useTranslation } from 'react-i18next';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';
import { getUserHandle } from '@/lib/users/handles';

const COPIED_CONFIRMATION_MS = 2000;

type Props = {
  uid: string;
};

export default function MyHandleCard({ uid }: Props) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);
  const [handle, setHandle] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getUserHandle(uid)
      .then(setHandle)
      .catch(() => setHandle(null));
  }, [uid]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), COPIED_CONFIRMATION_MS);
    return () => clearTimeout(id);
  }, [copied]);

  const handleCopy = () => {
    if (!handle) return;
    Clipboard.setStringAsync(handle)
      .then(() => setCopied(true))
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
        <PressableSurface
          testID="copy-handle-button"
          style={[styles.copyButton, !handle && styles.copyButtonDisabled]}
          onPress={handleCopy}
          disabled={!handle}
          accessibilityRole="button"
          feedback="standard"
        >
          <Text style={styles.copyText}>{t('shelf.copyId')}</Text>
        </PressableSurface>
      </View>
      {copied && <Text style={styles.copiedText}>{t('shelf.idCopied')}</Text>}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingVertical: 8,
      marginBottom: 16,
    },
    label: {
      fontSize: 12,
      color: colors.muted,
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
      color: colors.text,
    },
    handlePlaceholder: {
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.muted,
    },
    copyButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    copyButtonDisabled: {
      opacity: 0.5,
    },
    copyText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.primary,
    },
    copiedText: {
      fontSize: 12,
      color: colors.muted,
      marginTop: 4,
    },
  });
