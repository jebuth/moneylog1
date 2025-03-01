import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Screen3() {
  const { user, logout } = useAuth();
  
  // Access user preferences from context with fallback for safety
  const initialPreferences = user?.preferences || {
    theme: 'light',
    notifications: true
  };

  // Use local state to track changes (in a real app, you'd persist these)
  const [preferences, setPreferences] = useState(initialPreferences);
  
  // Toggle handler for notification switch
  const toggleNotifications = () => {
    setPreferences(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.heading}>User Preferences</Text>
        
        <View style={styles.preference}>
          <Text style={styles.preferenceText}>Theme: {preferences.theme}</Text>
        </View>
        
        <View style={styles.preference}>
          <Text style={styles.preferenceText}>Notifications</Text>
          <Switch
            value={preferences.notifications}
            onValueChange={toggleNotifications}
          />
        </View>
      </View>
      
      <Text style={styles.hint}>Swipe left to see your items</Text>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#f44336', marginTop: 20 }]}
        onPress={logout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  preferenceText: {
    fontSize: 16,
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
});