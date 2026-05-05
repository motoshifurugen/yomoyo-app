import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import FeedScreen from '@/screens/FeedScreen';
import ShelfScreen from '@/screens/ShelfScreen';
import { MainTabParamList } from './types';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
import GlassTabBar from '@/components/ui/GlassTabBar';
import AddFriendButton from '@/components/feed/AddFriendButton';
import SettingsLauncher from '@/components/settings/SettingsLauncher';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: yomoyoColors.background,
        },
        headerShadowVisible: false,
        headerTintColor: yomoyoColors.text,
        headerTitleStyle: {
          fontSize: yomoyoTypography.headerTitleSize,
          fontWeight: yomoyoTypography.titleWeight,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen
        name="Timeline"
        component={FeedScreen}
        options={{
          title: t('tabs.timeline'),
          headerRight: () => (
            <View style={styles.headerRight}>
              <AddFriendButton />
              <SettingsLauncher />
            </View>
          ),
        }}
      />
      <Tab.Screen name="Shelf" component={ShelfScreen} options={{ title: t('tabs.shelf') }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
