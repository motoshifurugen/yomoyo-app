import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import PressableSurface from '@/components/ui/PressableSurface';
import { isIsbn13, lookupByIsbn } from '@/lib/books/openBD';
import type { RootStackParamList } from '@/navigation/types';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useThemedStyles, type ThemeColors } from '@/lib/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Status = 'scanning' | 'looking' | 'notFound' | 'error';

export default function BarcodeScanScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const styles = useThemedStyles(makeStyles);
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<Status>('scanning');
  const lockRef = useRef(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (lockRef.current) return;
    if (!isIsbn13(data)) return;
    lockRef.current = true;
    setStatus('looking');
    try {
      const book = await lookupByIsbn(data);
      if (book) {
        navigation.replace('BookDetail', { book });
        return;
      }
      setStatus('notFound');
    } catch {
      setStatus('error');
    }
  };

  const handleTryAgain = () => {
    lockRef.current = false;
    setStatus('scanning');
  };

  if (permission && !permission.granted && !permission.canAskAgain) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackTitle}>{t('bookScan.permissionTitle')}</Text>
        <Text style={styles.fallbackBody}>{t('bookScan.permissionBody')}</Text>
        <PressableSurface
          style={styles.fallbackButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('bookScan.searchByTitle')}
          feedback="standard"
        >
          <Text style={styles.fallbackButtonText}>{t('bookScan.searchByTitle')}</Text>
        </PressableSurface>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        testID="barcode-camera"
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ['ean13'] }}
        onBarcodeScanned={status === 'scanning' ? handleBarcodeScanned : undefined}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        {status === 'scanning' && (
          <Text style={styles.hint}>{t('bookScan.hint')}</Text>
        )}

        {status === 'looking' && (
          <View style={styles.statusCard}>
            <ActivityIndicator />
            <Text style={styles.statusText}>{t('bookScan.looking')}</Text>
          </View>
        )}

        {status === 'notFound' && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>{t('bookScan.notFound')}</Text>
            <View style={styles.actionRow}>
              <PressableSurface
                style={styles.secondaryButton}
                onPress={handleTryAgain}
                accessibilityRole="button"
                accessibilityLabel={t('bookScan.tryAgain')}
                feedback="standard"
              >
                <Text style={styles.secondaryButtonText}>{t('bookScan.tryAgain')}</Text>
              </PressableSurface>
              <PressableSurface
                style={styles.primaryButton}
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel={t('bookScan.searchByTitle')}
                feedback="standard"
              >
                <Text style={styles.primaryButtonText}>{t('bookScan.searchByTitle')}</Text>
              </PressableSurface>
            </View>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>{t('bookScan.lookupError')}</Text>
            <PressableSurface
              style={styles.primaryButton}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel={t('bookScan.searchByTitle')}
              feedback="standard"
            >
              <Text style={styles.primaryButtonText}>{t('bookScan.searchByTitle')}</Text>
            </PressableSurface>
          </View>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    camera: { flex: 1 },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      padding: 24,
    },
    hint: {
      textAlign: 'center',
      color: colors.surface,
      fontSize: yomoyoTypography.screenBodySize,
      backgroundColor: 'rgba(0,0,0,0.45)',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    statusCard: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      gap: 14,
      alignItems: 'center',
    },
    statusText: {
      textAlign: 'center',
      color: colors.text,
      fontSize: yomoyoTypography.screenBodySize,
    },
    actionRow: { flexDirection: 'row', gap: 12 },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    primaryButtonText: {
      color: colors.surface,
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
    secondaryButton: {
      backgroundColor: colors.border,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
    fallbackContainer: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 24,
      justifyContent: 'center',
      gap: 16,
    },
    fallbackTitle: {
      textAlign: 'center',
      color: colors.text,
      fontSize: 20,
      fontWeight: yomoyoTypography.buttonWeight,
    },
    fallbackBody: {
      textAlign: 'center',
      color: colors.secondaryText,
      fontSize: yomoyoTypography.screenBodySize,
    },
    fallbackButton: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignSelf: 'center',
    },
    fallbackButtonText: {
      color: colors.surface,
      fontSize: yomoyoTypography.screenBodySize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
  });
