import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Dimensions
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Screen2() {
  const { user } = useAuth();
  
  // Trip information
  const [tripName, setTripName] = useState('Mexico Trip 2024');
  const [totalAmount, setTotalAmount] = useState(23624.69);
  
  // Categories with expenses
  const [categories, setCategories] = useState([
    { 
      id: 1, 
      name: 'Airfare', 
      amount: 330, 
      percentage: 5, 
      transactions: 2,
      color: '#5C5CFF' // Purple color for the icon
    },
    { 
      id: 2, 
      name: 'Accommodation', 
      amount: 1200, 
      percentage: 15, 
      transactions: 3,
      color: '#FF5C5C' // Red
    },
    { 
      id: 3, 
      name: 'Food', 
      amount: 750, 
      percentage: 10, 
      transactions: 8,
      color: '#5CFF5C' // Green
    },
    { 
      id: 4, 
      name: 'Transportation', 
      amount: 450, 
      percentage: 7, 
      transactions: 5,
      color: '#FFDD5C' // Yellow
    },
  ]);
  
  // Quick category buttons in the header section
  const quickCategories = [
    { id: 1, color: '#5C5CFF' },
    { id: 2, color: '#FF5C5C' },
    { id: 3, color: '#5CFF5C' },
    { id: 4, color: '#FFDD5C' }
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Card with Trip Name and Amount */}
      <LinearGradient
        colors={['#2D2D44', '#181830']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <View style={styles.headerContent}>
          <Text style={styles.tripName}>{tripName}</Text>
          <Text style={styles.totalAmount}>${totalAmount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</Text>
          
          <View style={styles.quickCategoryContainer}>
            {quickCategories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.quickCategoryButton, { backgroundColor: category.color }]}
              />
            ))}
          </View>
        </View>
      </LinearGradient>
      
      {/* Middle Section - Can be used for charts or other content */}
      <View style={styles.middleSection}>
        {/* Empty in the reference image, but you could add charts here */}
      </View>
      
      {/* Expense Categories List */}
      <ScrollView style={styles.categoriesSection}>
        {categories.map(category => (
          <TouchableOpacity key={category.id} style={styles.categoryCard}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]} />
            
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.transactionCount}>{category.transactions} transactions</Text>
            </View>
            
            <View style={styles.categoryAmount}>
              <Text style={styles.amountText}>${category.amount}</Text>
              <Text style={styles.percentageText}>{category.percentage}%</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Very dark background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    height: 180,
    overflow: 'hidden',
  },
  headerContent: {
    padding: 24,
  },
  tripName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  quickCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 16,
  },
  quickCategoryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
    opacity: 0.8,
  },
  middleSection: {
    height: 250,
    marginVertical: 16,
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#1D1D1D',
  },
  categoriesSection: {
    flex: 1,
    marginHorizontal: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#1D1D1D',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  transactionCount: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  percentageText: {
    fontSize: 14,
    color: '#AAAAAA',
    marginTop: 4,
  },
});