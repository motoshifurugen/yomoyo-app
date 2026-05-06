import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import { useVideoPlayer, VideoView } from 'expo-video';
import { markOnboardingDone } from '@/lib/onboarding';
import { finalizeAvatarIdentity } from '@/lib/users/avatarIdentity';
import { registerPushTokenAfterGrant } from '@/lib/notifications/registerPushToken';
import { useAuth } from '@/hooks/useAuth';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import { yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';
import { useTheme, useThemedStyles, type ThemeColors } from '@/lib/theme';

type Props = {
  onComplete: () => void;
};

const videoSource = require('../../assets/videos/notification_loop.mp4');

export default function OnboardingNotificationScreen({ onComplete }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const handleAllow = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted' && user) {
        await registerPushTokenAfterGrant(user.uid);
      } else if (status !== 'granted' && __DEV__) {
        console.log('[PushToken] Permission not granted — push token skipped.');
      }
    } catch {
      // permission request failure should not block onboarding completion
    }
    try {
      if (user) await finalizeAvatarIdentity(user.uid);
    } catch {
      // finalization failure should not block onboarding completion
    }
    try {
      await markOnboardingDone();
    } catch {
      // storage failure should not block onboarding completion
    }
    onComplete();
  };

  const handleSkip = async () => {
    try {
      if (user) await finalizeAvatarIdentity(user.uid);
    } catch {
      // finalization failure should not block onboarding completion
    }
    try {
      await markOnboardingDone();
    } catch {
      // storage failure should not block onboarding completion
    }
    onComplete();
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 24) + 16 },
      ]}
    >
      <OnboardingProgress
        currentStep={3}
        totalSteps={3}
        accessibilityLabel={t('onboarding.progressLabel', { current: 3, total: 3 })}
      />
      <View style={styles.content}>
        <View style={styles.videoFrame}>
          <View
            testID="notification-video-placeholder"
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.placeholder}
          >
            <Ionicons name="notifications-outline" size={64} color={colors.muted} />
          </View>
          <VideoView
            accessible={false}
            testID="notification-video"
            player={player}
            style={styles.video}
            contentFit="contain"
            nativeControls={false}
          />
        </View>
        <Text style={styles.heading}>{t('onboarding.notificationHeading')}</Text>
        <Text style={styles.body}>{t('onboarding.notificationBody')}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleAllow} accessibilityRole="button">
          <Text style={styles.buttonText}>{t('onboarding.allowButton')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip} accessibilityRole="button">
          <Text style={styles.skip}>{t('onboarding.skipLink')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: yomoyoSpacing.horizontalPadding,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoFrame: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: colors.surface,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
    },
    placeholder: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    video: {
      width: 180,
      height: 180,
      backgroundColor: 'transparent',
    },
    heading: {
      fontSize: yomoyoTypography.titleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 18,
    },
    body: {
      fontSize: yomoyoTypography.bodySize,
      fontWeight: yomoyoTypography.bodyWeight,
      lineHeight: yomoyoTypography.bodyLineHeight,
      color: colors.secondaryText,
      textAlign: 'center',
    },
    actions: {
      alignItems: 'center',
    },
    button: {
      width: '100%',
      height: yomoyoSpacing.buttonHeight,
      borderRadius: yomoyoSpacing.buttonRadius,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    buttonText: {
      color: colors.surface,
      fontSize: yomoyoTypography.buttonSize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
    skip: {
      fontSize: yomoyoTypography.secondaryActionSize,
      fontWeight: yomoyoTypography.secondaryActionWeight,
      color: colors.muted,
    },
  });
