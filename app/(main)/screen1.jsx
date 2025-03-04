import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Platform,
  Dimensions,
  Animated,
  KeyboardAvoidingView
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import CategorySelectorModal from '../../components/CategorySelectorModal';

const { width, height } = Dimensions.get('window');

export default function ExpenseTracker() {
  const { user } = useAuth();
  
  // Trip information
  const [tripName, setTripName] = useState('Mexico Trip 2024');
  const [totalAmount, setTotalAmount] = useState(23624.69);
  
  // Input states
  const [inputAmount, setInputAmount] = useState('320.33');
  const [description, setDescription] = useState('');
  
  // Animation states
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Category selection
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({ 
    id: 2, 
    name: 'Transportation', 
    amount: 330, 
    percentage: 5, 
    transactions: 2,
    color: '#5C5CFF' 
  });

  // Categories data with focus on Airfare for recent transactions
  const [categories, setCategories] = useState([
    { 
      id: 1, 
      name: 'Airfare', 
      amount: 330, 
      percentage: 5, 
      transactions: 2,
      color: '#5C5CFF' // Purple color
    },
    { 
      id: 2, 
      name: 'Transportation', 
      amount: 330, 
      percentage: 5, 
      transactions: 2,
      color: '#5C5CFF' 
    },
    { 
      id: 3, 
      name: 'Entertainment', 
      amount: 330, 
      percentage: 5, 
      transactions: 2,
      color: '#5C5CFF'
    },
    { 
      id: 4, 
      name: 'Food', 
      amount: 330, 
      percentage: 5, 
      transactions: 2,
      color: '#5C5CFF'
    },
    { 
      id: 5, 
      name: 'Groceries', 
      amount: 330, 
      percentage: 5, 
      transactions: 2,
      color: '#5C5CFF' 
    },
  ]);
  
  // Handle amount input changes
  const handleAmountChange = (text) => {
    // Remove all non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      setInputAmount('');
      return;
    }
    
    // Convert to cents (e.g., "234" becomes "2.34")
    const cents = parseInt(numericValue);
    
    // Format with commas and two decimal places
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
    
    setInputAmount(formattedAmount);
  };
  
  // Category modal handlers
  const openCategoryModal = () => {
    setCategoryModalVisible(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalVisible(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    closeCategoryModal();
  };

  // Animation functions for categories
  const expandCategories = () => {
    setCategoriesExpanded(true);
    Animated.spring(animatedHeight, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: false
    }).start();
  };

  const collapseCategories = () => {
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      setCategoriesExpanded(false);
    });
  };

  // Log the expense
  const handleLogExpense = () => {
    // Here you would typically save the expense to your backend
    alert(`Logged $${inputAmount} for ${selectedCategory.name}`);
    
    // Reset form
    setInputAmount('');
    setDescription('');
  };

  // Clear the form
  const handleClearForm = () => {
    setInputAmount('');
    setDescription('');
  };

  // Calculate animated styles for categories
  const animatedCategoriesStyle = {
    height: animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [90, height * 0.5]
    }),
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 10
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Card with Trip Name and Amount */}
      <LinearGradient
        colors={['#0F0F0F', '#1B1928', '#251E58', '#3F339F']}
        start={{ x: 0.5, y: 0 }}
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
            <TouchableOpacity
              style={[styles.quickCategoryButton, { backgroundColor: '#42404F' }]}
              onPress={() => {/* No functionality yet */}}
            />
            <TouchableOpacity
              style={[styles.quickCategoryButton, { backgroundColor: '#42404F' }]}
              onPress={() => {/* No functionality yet */}}
            />
            <TouchableOpacity
              style={[styles.quickCategoryButton, { backgroundColor: '#42404F' }]}
              onPress={() => {/* No functionality yet */}}
            />
            <TouchableOpacity
              style={[styles.quickCategoryButton, { backgroundColor: '#42404F' }]}
              onPress={() => {/* No functionality yet */}}
            />
          </View>
        </View>
      </LinearGradient>
      
      {/* Input Form */}
      <View style={styles.formContainer}>
        {/* Row 1: Amount and Category side by side */}
        <View style={{flexDirection: 'row', height:90}}>
          {/* Amount Input */}
          <View style={{flex: 0.75}}>
            <Text style={styles.inputLabel}>AMOUNT</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={inputAmount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#666"
              />
            </View>
          </View>
          
          {/* Category Selector */}
          <View style={{flex: 1}}>
            <Text style={styles.inputLabel}>CATEGORY</Text>
            <TouchableOpacity 
              style={styles.categorySelector}
              onPress={openCategoryModal}
            >
              <Text style={styles.categorySelectorText}>
                {selectedCategory ? selectedCategory.name : "Select Category"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Row 2: Description Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>DESCRIPTION</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder=""
            placeholderTextColor="#666"
            multiline={false}
          />
        </View>
        
        {/* Row 3: Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearForm}
          >
            <Text style={styles.clearButtonText}>CLEAR</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.logButton}
            onPress={handleLogExpense}
          >
            <Text style={styles.logButtonText}>LOG</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Bottom Categories Section */}
      <View style={styles.categoriesContainer}>
        <TouchableOpacity 
          style={styles.categoryCard}
          onPress={expandCategories}
        >
          <View style={[styles.categoryIcon, { backgroundColor: '#5C5CFF' }]} />
          
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>Airfare</Text>
            <Text style={styles.transactionCount}>2 transactions</Text>
          </View>
          
          <View style={styles.categoryAmount}>
            <Text style={styles.amountText}>$330</Text>
            <Text style={styles.percentageText}>5%</Text>
          </View>
        </TouchableOpacity>
        
        {/* Stacked category effects */}
        <View style={styles.mockCategoriesContainer}>
          <View style={[styles.mockCategoryCard, { top: 60, opacity: 0.6, marginLeft: 10, marginRight: 10 }]} />
          <View style={[styles.mockCategoryCard, { top: 70, opacity: 0.3, marginLeft: 20, marginRight: 20 }]} />
        </View>
      </View>
      
      {/* Category Selection Modal */}
      <CategorySelectorModal
        visible={categoryModalVisible}
        onClose={closeCategoryModal}
        onSelect={handleCategorySelect}
        categories={categories}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    height: 220,
    overflow: 'hidden',
  },
  headerContent: {
    padding: 24,
    paddingBottom: 16,
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
    justifyContent: 'space-between',
    marginTop: 5,
    paddingHorizontal: 0,
    width: '100%',
  },
  quickCategoryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginHorizontal: 10,
  },
  // Form Styles
  formContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#1D1D1D', // Dark gray background
    borderRadius: 16,
    padding: 16,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
    marginBottom: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1D1D',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 46, // here! 
    //height: 56,
    //flex: 0.5,
    marginRight: 8,
  },
  dollarSign: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
    
    
  },
  categorySelector: {
    padding: 12,
    backgroundColor: '#1D1D1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flex: 0.5,
    //marginLeft: 8,
    //height: 56,
    justifyContent: 'center',
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#999',
  },
  descriptionInput: {
    padding: 12,
    backgroundColor: '#1D1D1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
    color: '#999',
    //minHeight: 56,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  clearButton: {
    flex: 0.75,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    //padding: 12,
    //marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    //height: 56,
  },
  clearButtonText: {
    color: '#999',
    fontWeight: '600',
    fontSize: 16,
  },
  logButton: {
    flex: 1,
    backgroundColor: '#5C5CFF',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    //height: 56,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Categories Section
  categoriesContainer: {
    marginHorizontal: 16,
    marginTop: 160, // TODO: this might need to change 
    zIndex: 10
    
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 50,
    backgroundColor: '#1D1D1D',
    marginBottom: 10,
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
    marginRight: 8
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  percentageText: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  mockCategoriesContainer: {
    position: 'absolute',
    bottom: 60, // Increased this value to move the stack higher
    left: 16,
    right: 16,
    height: 25,
    zIndex: 1, // Above the background but below the categories
  },
  mockCategoryCard: {
    position: 'absolute',
    height: 25,
    left: 0,
    right: 0,
    backgroundColor: '#1D1D1D',
    borderRadius: 50,
  },
});