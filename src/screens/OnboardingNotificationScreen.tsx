import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import { useVideoPlayer, VideoView } from 'expo-video';
import { markOnboardingDone } from '@/lib/onboarding';
import { finalizeAvatarIdentity } from '@/lib/users/avatarIdentity';
import { useAuth } from '@/hooks/useAuth';
import { yomoyoColors, yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';

type Props = {
  onComplete: () => void;
};

const videoSource = require('../../assets/videos/notification_loop.mp4');

export default function OnboardingNotificationScreen({ onComplete }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const player = useVideoPlayer(videoSource, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const handleAllow = async () => {
    try {
      await Notifications.requestPermissionsAsync();
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
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.videoFrame}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: yomoyoColors.background,
    paddingHorizontal: yomoyoSpacing.horizontalPadding,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 64,
  },
  videoFrame: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: yomoyoColors.surface,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  video: {
    width: 180,
    height: 180,
  },
  heading: {
    fontSize: yomoyoTypography.titleSize,
    fontWeight: yomoyoTypography.titleWeight,
    color: yomoyoColors.text,
    textAlign: 'center',
    marginBottom: 18,
  },
  body: {
    fontSize: yomoyoTypography.bodySize,
    fontWeight: yomoyoTypography.bodyWeight,
    lineHeight: yomoyoTypography.bodyLineHeight,
    color: yomoyoColors.secondaryText,
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: yomoyoSpacing.buttonHeight,
    borderRadius: yomoyoSpacing.buttonRadius,
    backgroundColor: yomoyoColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: yomoyoColors.surface,
    fontSize: yomoyoTypography.buttonSize,
    fontWeight: yomoyoTypography.buttonWeight,
  },
  skip: {
    fontSize: yomoyoTypography.secondaryActionSize,
    fontWeight: yomoyoTypography.secondaryActionWeight,
    color: yomoyoColors.muted,
  },
});
