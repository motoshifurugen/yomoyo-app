import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DISPLAY_NAME_MAX } from '@/lib/users/avatarIdentity';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';

export type DisplayNameError = 'empty' | 'too_long' | 'has_newline';

type Props = {
  value: string;
  onChangeText: (next: string) => void;
  error?: DisplayNameError;
};

const ERROR_KEYS: Record<DisplayNameError, string> = {
  empty: 'profile.displayName.errors.empty',
  too_long: 'profile.displayName.errors.tooLong',
  has_newline: 'profile.displayName.errors.newline',
};

// Hard cap on raw keystrokes — actual validation lives in `validateDisplayName`.
// Set generously above DISPLAY_NAME_MAX so paste of long strings still triggers
// the proper "too long" error message instead of being silently truncated.
const INPUT_MAX_CHARS = DISPLAY_NAME_MAX * 4;

export default function DisplayNameInput({ value, onChangeText, error }: Props) {
  const { t } = useTranslation();
  return (
    <View>
      <TextInput
        testID="display-name-input"
        value={value}
        onChangeText={onChangeText}
        multiline={false}
        maxLength={INPUT_MAX_CHARS}
        placeholder={t('profile.displayName.placeholder')}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      {error !== undefined && (
        <Text
          testID="display-name-error"
          accessibilityLiveRegion="polite"
          style={styles.errorText}
        >
          {t(ERROR_KEYS[error])}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: yomoyoColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: yomoyoTypography.screenBodySize,
    color: yomoyoColors.text,
    backgroundColor: yomoyoColors.surface,
  },
  errorText: {
    marginTop: 6,
    fontSize: yomoyoTypography.errorSize,
    color: yomoyoColors.error,
  },
});
