import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Screen1() {
  const { user, logout } = useAuth();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.heading}>User Info</Text>
          <Text style={styles.userInfo}>Name: {user?.name || 'User'}</Text>
          <Text style={styles.userInfo}>Email: {user?.email || 'user@example.com'}</Text>
        </View>
        
        <Text style={styles.hint}>Swipe right to see your items</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
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
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 5,
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});