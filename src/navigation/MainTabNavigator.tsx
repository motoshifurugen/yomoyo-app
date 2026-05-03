import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import FeedScreen from '@/screens/FeedScreen';
import FriendsScreen from '@/screens/FriendsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: t('tabs.feed') }} />
      <Tab.Screen name="Friends" component={FriendsScreen} options={{ title: t('tabs.friends') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('tabs.settings') }} />
    </Tab.Navigator>
  );
}
