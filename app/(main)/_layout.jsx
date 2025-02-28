import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Screen1 from './screen1';
import Screen2 from './screen2';
import Screen3 from './screen3';

const Tab = createMaterialTopTabNavigator();

export default function MainLayout() {
  const { isAuthenticated } = useAuth();
  
  // Prevent access to main screens if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <Tab.Navigator
      initialRouteName="screen2"
      tabBarPosition="bottom"
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#f8f8f8',
        tabBarStyle: {
          backgroundColor: '#f4511e',
        },
        //tabBarStyle:{ display: 'none'}, // to hide tab bar
        tabBarIndicatorStyle: {
          backgroundColor: '#fff',
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
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="screen2"
        component={Screen2}
        options={{
          tabBarLabel: 'Items',
          tabBarIcon: ({ color }) => (
            <Ionicons name="list" color={color} size={22} />
          ),
        }}
      />
      <Tab.Screen
        name="screen3"
        component={Screen3}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" color={color} size={22} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}