import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FeedScreen from '@/screens/FeedScreen';
import FriendsScreen from '@/screens/FriendsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
