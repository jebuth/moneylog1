import React from 'react';
import {SafeAreaView} from 'react-native'
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
//import {LogProvider} from '../contexts/LogContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {


  return (
    <>
    <SafeAreaProvider>
    {/* <StatusBar style="auto" />   */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <ThemeProvider>
          <Stack
            screenOptions={{
              // gestureResponseDistance: {
              //   horizontal: 200, // Default is around 50, higher number requires longer swipe
              // },
              headerShown: false,
              // headerStyle: {
              //   backgroundColor: "green"
              // }
              // statusBarBackgroundColor: "red",
              // statusBarTranslucent: true
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
          </ThemeProvider>  
        </AuthProvider>
        
      </GestureHandlerRootView> 
      </SafeAreaProvider>
    </>
  );
}