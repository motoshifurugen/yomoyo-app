import React from 'react';
import { useTranslation } from 'react-i18next';
import HeaderIconButton from '@/components/ui/HeaderIconButton';

type Props = {
  onPress: () => void;
};

export default function SettingsButton({ onPress }: Props) {
  const { t } = useTranslation();

  return (
    <HeaderIconButton
      testID="settings-button"
      iconName="settings-outline"
      accessibilityLabel={t('settings.openSettings')}
      onPress={onPress}
    />
  );
}
