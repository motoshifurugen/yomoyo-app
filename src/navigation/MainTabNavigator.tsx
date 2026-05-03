import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import FeedScreen from '@/screens/FeedScreen';
import FriendsScreen from '@/screens/FriendsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { MainTabParamList } from './types';
import { yomoyoColors } from '@/constants/yomoyoTheme';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Feed: { active: 'book', inactive: 'book-outline' },
  Friends: { active: 'people', inactive: 'people-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

export default function MainTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: yomoyoColors.background,
        },
        headerShadowVisible: false,
        headerTintColor: yomoyoColors.text,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700' as const,
        },
        headerTitleAlign: 'center',
        tabBarStyle: {
          backgroundColor: yomoyoColors.surface,
          borderTopWidth: 1,
          borderTopColor: yomoyoColors.border,
        },
        tabBarActiveTintColor: yomoyoColors.primary,
        tabBarInactiveTintColor: yomoyoColors.muted,
        tabBarLabel: ({ focused, color, children }) => (
          <Text style={{ fontSize: 12, fontWeight: focused ? '600' : '500', color }}>
            {children}
          </Text>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name] ?? {
            active: 'help-circle',
            inactive: 'help-circle-outline',
          };
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: t('tabs.feed') }} />
      <Tab.Screen name="Friends" component={FriendsScreen} options={{ title: t('tabs.friends') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('tabs.settings') }} />
    </Tab.Navigator>
  );
}
