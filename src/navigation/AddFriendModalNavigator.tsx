import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddFriendScreen from '@/screens/AddFriendScreen';
import UserProfileScreen from '@/screens/UserProfileScreen';
import type { AddFriendStackParamList } from './types';

const Stack = createNativeStackNavigator<AddFriendStackParamList>();

/** Nested stack inside the AddFriend modal — keeps profile transitions in-modal. */
export default function AddFriendModalNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AddFriend" component={AddFriendScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  );
}
