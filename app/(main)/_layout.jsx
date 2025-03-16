import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Screen1 from './screen1';
import Screen2 from './screen2';
import Screen3 from './screen3';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, StyleSheet, StatusBar } from 'react-native';
//import {StatusBar} from 'expo-status-bar';


const Tab = createMaterialTopTabNavigator();

export default function MainLayout() {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  
  // Prevent access to main screens if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <>
    {/* <StatusBar style="light" /> */}
    {/* THIS safeAreaView determines the status bar color */}
    <SafeAreaView style={[styles.container, {backgroundColor: theme.background}]}>
    <Tab.Navigator
      initialRouteName="screen2"
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: '#5C5CFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: theme.background,
          // borderTopWidth: 1,
          // borderColor: '#999'
          //display: 'none'
        },
        //tabBarStyle:{ display: 'none'}, // to hide tab bar
        tabBarIndicatorStyle: {
          display: 'none'
          //backgroundColor: '#121212',
        },
        swipeEnabled: true,
        animationEnabled: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarShowIcon: true,
      }}
    >
      <Tab.Screen
        name="screen1"
        component={Screen1}
        options={{
          tabBarLabel: 'Spend',
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet-outline" color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="screen2"
        component={Screen2}
        options={{
          tabBarLabel: 'Logs',
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text-outline" color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="screen3"
        component={Screen3}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons name="cog-outline" color={color} size={22} />
          ),
        }}
      />
    </Tab.Navigator>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: Platform.OS === 'android' ? StatusBar.currentHeight : -20, // adjust bottom tab bar height
  },
  // header: {
  //   height: 60,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: '#4511e',
  // }
});