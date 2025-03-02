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
  Animated
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import CategorySelectorModal from '../../components/CategorySelectorModal';

const { width, height } = Dimensions.get('window');

export default function Screen1() {
  const { user } = useAuth();
  
  // Trip information
  const [tripName, setTripName] = useState('Mexico Trip 2024');
  const [totalAmount, setTotalAmount] = useState(23624.69);
  
  // Input amount
  //const [inputAmount, setInputAmount] = useState(0.00);
  const [inputAmount, setInputAmount] = useState('');
  
  // Animation state
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  // category input
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Add these with your other state variables
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // To open the modal
  const openCategoryModal = () => {
    setCategoryModalVisible(true);
  };

  // To close the modal
  const closeCategoryModal = () => {
    setCategoryModalVisible(false);
  };

  // Handler for category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };
  
  // Categories with expenses
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
  
  useEffect(() => {
    // Parse the numeric amount (handle commas and empty values)
    const numericAmount = parseFloat((inputAmount || '0').replace(/,/g, '')) || 0;
    
    if (numericAmount > 1.00) {
      // Fade in and slide up animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Fade out and slide down animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [inputAmount, fadeAnim, slideAnim]);

  // Animation to expand categories
  const expandCategories = () => {
    setCategoriesExpanded(true);
    Animated.spring(animatedHeight, {
      toValue: 1,
      friction: 80,
      tension: 40,
      useNativeDriver: false
    }).start();
  };

  // Animation to collapse categories
  const collapseCategories = () => {
    Animated.timing(animatedHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false
    }).start(() => {
      setCategoriesExpanded(false);
    });
  };

  // Function to format the input amount
  const formatAmount = (text) => {
    // Remove non-numeric characters
    const numericValue = text.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts[1];
    }
    
    // Format with 2 decimal places when needed
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return numericValue;
  };

  // Calculate animated styles for bottom-up expansion
  const animatedCategoriesStyle = {
    height: animatedHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [90, height * 0.65] // From single category height to almost full screen
    }),
    bottom: 50, // Move the initial position up by adding bottom padding
    position: 'absolute',
    left: 16,
    right: 16,
    opacity: animatedHeight.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.8, 1] // Subtle fade effect during transition
    })
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
      
      {/* Middle Section - Amount Input */}
      {!categoriesExpanded && (
      <>
      <View style={styles.inputSection}>
          <View style={styles.amountContainer}>
            <Text style={styles.dollarSign}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={inputAmount}
              onChangeText={(text) => {
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
              }}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#666"
              textAlign="right"
            />
          </View>
      </View>

      <Animated.View 
  style={[
    styles.categoryContainer,
    {
      opacity: fadeAnim,
      transform: [
        { translateY: slideAnim }
        //{ scale: pulseAnim }
      ],
    }
  ]}
>
  <TouchableOpacity 
    style={styles.categorySelector}
    onPress={() => setCategoryModalVisible(true)}
  >
    <Text style={styles.categoryLabel}>
      {selectedCategory ? selectedCategory.name : "Select Category"}
    </Text>
    <View 
      style={[
        styles.categoryIcon, 
        { backgroundColor: selectedCategory ? selectedCategory.color : '#4169E1' }
      ]} 
    />
  </TouchableOpacity>
</Animated.View>
      </>
      )}
      
      {/* Space between input and categories */}
      {!categoriesExpanded && <View style={styles.spacer} />}
      
      {/* Animated Categories Section */}
      <Animated.View style={[styles.categoriesContainer, animatedCategoriesStyle]}>
        <ScrollView 
          style={styles.categoriesScrollView}
          scrollEnabled={categoriesExpanded}
        >
          {categories.map((category, index) => (
            <TouchableOpacity 
              key={category.id} 
              style={[
                styles.categoryCard,
                index === 0 && !categoriesExpanded && styles.firstCategoryCard
              ]}
              onPress={() => {
                if (!categoriesExpanded && index === 0) {
                  expandCategories();
                }
              }}
            >
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
        
        {/* Collapse button */}
        {categoriesExpanded && (
          <TouchableOpacity 
            style={styles.collapseButton}
            onPress={collapseCategories}
          >
            <Text style={styles.collapseButtonText}>Collapse</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {/* Bottom mock categories for stacked effect - only visible when collapsed */}
      {!categoriesExpanded && (
        <View style={styles.mockCategoriesContainer}>
          <View style={[styles.mockCategoryCard, { top: 60, opacity: 0.6, marginLeft: 10, marginRight: 10 }]} />
          <View style={[styles.mockCategoryCard, { top: 70, opacity: 0.3, marginLeft: 20, marginRight: 20 }]} />
        </View>
      )}
      
      {/* Empty space at the bottom to allow room for the categories when expanded */}
      <View style={{ height: categoriesExpanded ? height * 0.65 : 140 }} />

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
    backgroundColor: '#121212', // Very dark background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    height: 220,
    overflow: 'hidden',
    //borderWidth: 1,  // Optional: adds a border to match Image 2
    //borderColor: 'rgba(255, 80, 0, 0.7)', // Orange border to match Image 2
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
    paddingHorizontal: 10,
    width: '100%',
  },
  quickCategoryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginHorizontal: 5,
  },
  inputSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1D1D1D',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountInput: {
    fontSize: 36,
    fontWeight: '500',
    color: '#999',
    textAlign: 'center',
    width: '100%',
    padding: 16,
  },
  spacer: {
    height: 120, // Reduced height to move categories up
  },
  categoriesContainer: {
    overflow: 'hidden',
    borderRadius: 24,
    zIndex: 10, // Ensure it's above everything else
  },
  categoriesScrollView: {
    flex: 1,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#1D1D1D',
    marginBottom: 10,
  },
  firstCategoryCard: {
    marginBottom: 0, // No margin for first card when collapsed
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
  mockCategoriesContainer: {
    position: 'absolute',
    bottom: 80, // Increased this value to move the stack higher
    left: 16,
    right: 16,
    height: 50,
    zIndex: 1, // Above the background but below the categories
  },
  mockCategoryCard: {
    position: 'absolute',
    height: 30,
    left: 0,
    right: 0,
    backgroundColor: '#1D1D1D',
    borderRadius: 24,
  },
  collapseButton: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  collapseButtonText: {
    color: '#AAAAAA',
    fontWeight: 'bold',
  },

  // format number input
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  dollarSign: {
    fontSize: 36,
    fontWeight: '500',
    color: '#999',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '500',
    color: '#999',
    padding: 16,
    textAlign: 'right',
  },

  // category input

  categoryContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1D1D1D',
    borderRadius: 24,
    padding: 16,
    zIndex: 10,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  categoryLabel: {
    fontSize: 18,
    color: '#999',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4169E1', // Blue circle as shown in screenshot
  },

  // category modal

});