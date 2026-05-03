import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import LoginScreen from '@/screens/LoginScreen';
import { useAuth } from '@/hooks/useAuth';

type AuthStackParamList = {
  App: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
