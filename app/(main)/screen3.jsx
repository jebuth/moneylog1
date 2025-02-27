import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function Screen3() {
  const { user } = useAuth();
  
  // Access user preferences from context
  const preferences = user.preferences || {};
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screen 3</Text>
      
      <View style={styles.card}>
        <Text style={styles.heading}>User Preferences</Text>
        
        <View style={styles.preference}>
          <Text style={styles.preferenceText}>Theme: {preferences.theme}</Text>
        </View>
        
        <View style={styles.preference}>
          <Text style={styles.preferenceText}>Notifications</Text>
          <Switch
            value={preferences.notifications}
            disabled={true}
          />
        </View>
      </View>
      
      <View style={styles.navButtons}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#2196F3' }]}
          onPress={() => router.push('/(main)/screen2')}
        >
          <Text style={styles.buttonText}>Back to Screen 2</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});