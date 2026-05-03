import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import BookDetailScreen from '@/screens/BookDetailScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: 'Book Detail' }} />
    </Stack.Navigator>
  );
}
