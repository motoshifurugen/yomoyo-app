import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import HeaderIconButton from '@/components/ui/HeaderIconButton';
import PressableSurface from '@/components/ui/PressableSurface';
import SettingsDialog from '@/components/settings/SettingsDialog';
import UtilityPanel from './UtilityPanel';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import { useTheme, useThemedStyles, type ThemeColors } from '@/lib/theme';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type RowProps = {
  testID: string;
  iconName: IoniconName;
  label: string;
  onPress: () => void;
};

function UtilityRow({ testID, iconName, label, onPress }: RowProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeRowStyles);
  return (
    <PressableSurface
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.row}
      feedback="standard"
    >
      <Ionicons name={iconName} size={22} color={colors.text} style={styles.leadingIcon} />
      <Text style={styles.label}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </PressableSurface>
  );
}

export default function UtilityMenuLauncher() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [panelOpen, setPanelOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleOpen = useCallback(() => setPanelOpen(true), []);
  const handleClose = useCallback(() => setPanelOpen(false), []);
  const handleSettingsClose = useCallback(() => setSettingsOpen(false), []);

  const handleEditProfile = useCallback(() => {
    setPanelOpen(false);
    navigation.navigate('EditProfile');
  }, [navigation]);

  const handleAddFriend = useCallback(() => {
    setPanelOpen(false);
    navigation.navigate('AddFriend');
  }, [navigation]);

  const handleAppearance = useCallback(() => {
    setPanelOpen(false);
    setSettingsOpen(true);
  }, []);

  const styles = useThemedStyles(makeStyles);

  return (
    <>
      <HeaderIconButton
        testID="utility-menu-button"
        iconName="menu"
        accessibilityLabel={t('menu.openMenu')}
        onPress={handleOpen}
      />
      <UtilityPanel visible={panelOpen} onClose={handleClose}>
        <View style={styles.rows}>
          <UtilityRow
            testID="utility-menu-row-edit-profile"
            iconName="person-circle-outline"
            label={t('menu.editProfile')}
            onPress={handleEditProfile}
          />
          <UtilityRow
            testID="utility-menu-row-add-friend"
            iconName="person-add-outline"
            label={t('menu.addFriend')}
            onPress={handleAddFriend}
          />
          <UtilityRow
            testID="utility-menu-row-appearance"
            iconName="settings-outline"
            label={t('menu.appearanceLanguage')}
            onPress={handleAppearance}
          />
        </View>
      </UtilityPanel>
      <SettingsDialog visible={settingsOpen} onClose={handleSettingsClose} />
    </>
  );
}

const makeStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    rows: {
      gap: 4,
    },
  });

const makeRowStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
    },
    leadingIcon: {
      marginRight: 14,
    },
    label: {
      flex: 1,
      fontSize: yomoyoTypography.screenBodySize,
      color: colors.text,
      fontWeight: yomoyoTypography.buttonWeight,
    },
  });
