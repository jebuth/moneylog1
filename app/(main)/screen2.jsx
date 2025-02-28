import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function Screen2() {
  const { user } = useAuth();
  
  // Access user data from context with fallback for safety
  const items = user?.data?.items || [
    { id: 1, name: 'Default Item 1' },
    { id: 2, name: 'Default Item 2' },
    { id: 3, name: 'Default Item 3' }
  ];
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Items</Text>
      
      <View style={styles.card}>
        <Text style={styles.heading}>Your Items</Text>
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
      
      <Text style={styles.hint}>Swipe left to see profile, swipe right to see settings</Text>
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
  hint: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
});