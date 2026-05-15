import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PressableSurface from '@/components/ui/PressableSurface';
import { useTheme, useThemedStyles, type ThemeColors } from '@/lib/theme';

const PANEL_WIDTH_RATIO = 0.82;
const SLIDE_IN_MS = 240;
const SLIDE_OUT_MS = 200;

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function UtilityPanel({ visible, onClose, children }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(makeStyles);
  const panelWidth = Dimensions.get('window').width * PANEL_WIDTH_RATIO;
  const translateX = useRef(new Animated.Value(panelWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: SLIDE_IN_MS,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: SLIDE_IN_MS,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: panelWidth,
          duration: SLIDE_OUT_MS,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: SLIDE_OUT_MS,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, backdropOpacity, panelWidth]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View
          pointerEvents={visible ? 'auto' : 'none'}
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <Pressable
            testID="utility-panel-backdrop"
            accessibilityRole="button"
            accessibilityLabel={t('menu.dismiss')}
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View
          testID="utility-panel-content"
          style={[
            styles.panel,
            { width: panelWidth, transform: [{ translateX }] },
          ]}
        >
          <View style={[styles.panelHeader, { paddingTop: insets.top + 8 }]}>
            <PressableSurface
              testID="utility-panel-close"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('menu.close')}
              style={styles.closeButton}
              hitSlop={8}
              feedback="standard"
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </PressableSurface>
          </View>
          <View style={[styles.body, { paddingBottom: insets.bottom + 16 }]}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      flexDirection: 'row',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    panel: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      backgroundColor: colors.background,
      shadowColor: colors.text,
      shadowOffset: { width: -2, height: 0 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 8,
    },
    panelHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 12,
    },
    closeButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    body: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
  });
