import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import FeedScreen from '@/screens/FeedScreen';
import ShelfScreen from '@/screens/ShelfScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { MainTabParamList } from './types';
import { yomoyoColors, yomoyoTypography } from '@/constants/yomoyoTheme';
import GlassTabBar from '@/components/ui/GlassTabBar';

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
      <Tab.Screen name="Timeline" component={FeedScreen} options={{ title: t('tabs.timeline') }} />
      <Tab.Screen name="Shelf" component={ShelfScreen} options={{ title: t('tabs.shelf') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('tabs.settings') }} />
    </Tab.Navigator>
  );
}
