import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import BookSearchScreen from '@/screens/BookSearchScreen';
import BookDetailScreen from '@/screens/BookDetailScreen';
import UserProfileScreen from '@/screens/UserProfileScreen';
import AddFriendScreen from '@/screens/AddFriendScreen';
import EditProfileScreen from '@/screens/EditProfileScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="BookSearch" component={BookSearchScreen} options={{ title: 'Search Books' }} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: 'Book Detail' }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddFriend"
        component={AddFriendScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
