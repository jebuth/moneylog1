import React from 'react';
import { SafeAreaView } from 'react-native'
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  return (
    <>
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              // Disable animation for initial screen
              animation: 'none',
            }}
          >
            <Stack.Screen 
              name="(auth)" 
              options={{ 
                headerShown: false,
                // Specifically disable animation for auth screen
                animation: 'none'
              }} 
            />
            <Stack.Screen 
              name="(main)" 
              options={{ 
                headerShown: false,
                // Regular animations for main app transitions
                animation: 'default'
              }} 
            />
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
          </ThemeProvider>  
        </AuthProvider>
      </GestureHandlerRootView> 
      </SafeAreaProvider>
    </>
  );
}