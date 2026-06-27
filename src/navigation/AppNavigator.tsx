import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MainTabNavigator from './MainTabNavigator';
import BookSearchScreen from '@/screens/BookSearchScreen';
import BarcodeScanScreen from '@/screens/BarcodeScanScreen';
import BookDetailScreen from '@/screens/BookDetailScreen';
import UserProfileScreen from '@/screens/UserProfileScreen';
import AddFriendModalNavigator from './AddFriendModalNavigator';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { t } = useTranslation();

  return (
    // headerTitle hides visible header text; per-screen `title` is retained so iOS
    // back-button labels and screen-reader announcements still have a meaningful name.
    <Stack.Navigator screenOptions={{ headerTitle: () => null }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="BookSearch" component={BookSearchScreen} options={{ title: t('bookSearch.title') }} />
      <Stack.Screen name="BarcodeScan" component={BarcodeScanScreen} options={{ title: t('bookScan.title') }} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: t('bookDetail.title') }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddFriendFlow"
        component={AddFriendModalNavigator}
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
