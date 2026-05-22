import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import BookSearchScreen from '@/screens/BookSearchScreen';
import BarcodeScanScreen from '@/screens/BarcodeScanScreen';
import BookDetailScreen from '@/screens/BookDetailScreen';
import UserProfileScreen from '@/screens/UserProfileScreen';
import AddFriendScreen from '@/screens/AddFriendScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    // headerTitle hides visible header text; per-screen `title` is retained so iOS
    // back-button labels and screen-reader announcements still have a meaningful name.
    <Stack.Navigator screenOptions={{ headerTitle: () => null }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="BookSearch" component={BookSearchScreen} options={{ title: 'Search Books' }} />
      <Stack.Screen name="BarcodeScan" component={BarcodeScanScreen} options={{ title: 'Scan Barcode' }} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: 'Book Detail' }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddFriend"
        component={AddFriendScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
