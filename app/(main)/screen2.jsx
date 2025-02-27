import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function Screen2() {
  const { user } = useAuth();
  
  // Access user data from context
  const items = user.data.items || [];
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Screen 2</Text>
      
      <View style={styles.card}>
        <Text style={styles.heading}>User Items</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.name}</Text>
            </View>
          )}
          style={styles.list}
        />
      </View>
      
      <View style={styles.navButtons}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#2196F3', marginRight: 10 }]}
          onPress={() => router.push('/(main)/screen1')}
        >
          <Text style={styles.buttonText}>Back to Screen 1</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#4CAF50' }]}
          onPress={() => router.push('/(main)/screen3')}
        >
          <Text style={styles.buttonText}>Go to Screen 3</Text>
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
    marginBottom: 10,
  },
  list: {
    maxHeight: 300,
  },
  item: {
    backgroundColor: '#e9e9e9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemText: {
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