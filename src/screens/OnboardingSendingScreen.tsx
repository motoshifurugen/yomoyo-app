import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PressableSurface from '@/components/ui/PressableSurface';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import UseCaseHighlight from '@/components/onboarding/UseCaseHighlight';
import { yomoyoTypography, yomoyoSpacing } from '@/constants/yomoyoTheme';
import { useTheme, useThemedStyles, type ThemeColors } from '@/lib/theme';

type Props = {
  onComplete: () => void;
};

// Final onboarding step. Concept-only: it illustrates the "sending" side of
// Yomoyo (share your ID + record a finished book) so a new reader pictures
// their own finishes reaching friends. No real action happens here.
export default function OnboardingSendingScreen({ onComplete }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

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
        <View style={styles.hero}>
          <View
            style={styles.iconFrame}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Ionicons name="paper-plane-outline" size={64} color={colors.primary} />
          </View>
          <Text style={styles.heading}>{t('onboarding.sendHeading')}</Text>
        </View>
        <View style={styles.stepsSection}>
          <Text style={styles.body}>{t('onboarding.sendBody')}</Text>
          <View style={styles.highlights}>
            <UseCaseHighlight
              testID="send-highlight-share-id"
              icon="share-outline"
              label={t('onboarding.sendHighlightShareId')}
            />
            <UseCaseHighlight
              testID="send-highlight-record"
              icon="book-outline"
              label={t('onboarding.sendHighlightRecord')}
            />
          </View>
        </View>
      </View>
      <View style={styles.actions}>
        <PressableSurface
          testID="onboarding-send-start"
          style={styles.button}
          onPress={onComplete}
          accessibilityRole="button"
          feedback="confirming"
        >
          <Text style={styles.buttonText}>{t('onboarding.sendButton')}</Text>
        </PressableSurface>
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
      justifyContent: 'center',
    },
    hero: {
      alignItems: 'center',
    },
    iconFrame: {
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
    },
    heading: {
      fontSize: yomoyoTypography.titleSize,
      fontWeight: yomoyoTypography.titleWeight,
      color: colors.text,
      textAlign: 'center',
    },
    stepsSection: {
      alignSelf: 'stretch',
      marginTop: 32,
    },
    body: {
      fontSize: yomoyoTypography.bodySize,
      fontWeight: yomoyoTypography.bodyWeight,
      lineHeight: yomoyoTypography.bodyLineHeight,
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 18,
    },
    highlights: {
      gap: 18,
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
    },
    buttonText: {
      color: colors.surface,
      fontSize: yomoyoTypography.buttonSize,
      fontWeight: yomoyoTypography.buttonWeight,
    },
  });
