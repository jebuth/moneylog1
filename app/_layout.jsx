import React from 'react';
import { Slot, Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
//import {LogProvider} from '../contexts/LogContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';



export default function RootLayout() {
  return (
    <>
    <SafeAreaProvider>
    {/* <StatusBar style="auto" />   */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          
          <Stack
            screenOptions={{
              headerShown: false,
              headerStyle: {
                backgroundColor: "green"
              }
              // statusBarBackgroundColor: "red",
              // statusBarTranslucent: true
            }}
          >

{/* <key>UIViewControllerBasedStatusBarAppearance</key> */}
            <Stack.Screen name="(auth)" options={{ headerShown: false, headerStyle: {backgroundColor: "#121212"} }} />
            <Stack.Screen name="(main)" options={{ headerShown: false, headerStyle: {backgroundColor: "#121212"}  }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
          
        </AuthProvider>
      </GestureHandlerRootView> 
    </SafeAreaProvider>
    </>
  );
}