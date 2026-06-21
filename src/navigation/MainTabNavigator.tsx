import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import FeedScreen from '@/screens/FeedScreen';
import ShelfScreen from '@/screens/ShelfScreen';
import { MainTabParamList } from './types';
import { useTheme } from '@/lib/theme';
import { yomoyoTypography } from '@/constants/yomoyoTheme';
import GlassTabBar from '@/components/ui/GlassTabBar';
import AddFriendButton from '@/components/feed/AddFriendButton';
import BookmarkFilterToggle from '@/components/feed/BookmarkFilterToggle';
import SettingsLauncher from '@/components/settings/SettingsLauncher';
import { BookmarkFilterProvider } from '@/lib/books/bookmarkFilterContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <BookmarkFilterProvider>
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontSize: yomoyoTypography.headerTitleSize,
          fontWeight: yomoyoTypography.titleWeight,
        },
        headerTitleAlign: 'center',
        headerTitle: () => null,
      }}
    >
      <Tab.Screen
        name="Timeline"
        component={FeedScreen}
        options={{
          title: t('tabs.timeline'),
          headerLeftContainerStyle: { paddingLeft: 8 },
          headerLeft: () => <BookmarkFilterToggle />,
        }}
      />
      <Tab.Screen
        name="Shelf"
        component={ShelfScreen}
        options={{
          title: t('tabs.shelf'),
          headerRightContainerStyle: { paddingRight: 8 },
          headerRight: () => (
            <View style={styles.headerRight}>
              <AddFriendButton />
              <SettingsLauncher />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
    </BookmarkFilterProvider>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
