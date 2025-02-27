import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function MainLayout() {
  const { isAuthenticated } = useAuth();
  
  // Prevent access to main screens if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="screen1"
        options={{ title: 'Screen 1' }}
      />
      <Stack.Screen
        name="screen2"
        options={{ title: 'Screen 2' }}
      />
      <Stack.Screen
        name="screen3"
        options={{ title: 'Screen 3' }}
      />
    </Stack>
  );
}