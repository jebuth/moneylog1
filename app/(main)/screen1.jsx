import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  Animated,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import CategorySelectorModal from '../../components/CategorySelectorModal';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ExpenseTracker() {
  const { user, logs, currentLog, updateLog, isLoading } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  
  // Animation values for entrance animations
  const headerAnim = useRef(new Animated.Value(-300)).current; // Start above the screen
  const formAnim = useRef(new Animated.Value(500)).current; // Start below the screen
  const categoryAnim = useRef(new Animated.Value(500)).current; // Start below the screen
  const fadeAnim = useRef(new Animated.Value(0)).current; // For fade in
  
  // Trip information from currentLog
  const [logTitle, setlogTitle] = useState(currentLog ? currentLog.logTitle : 'New Trip');
  const [totalAmount, setTotalAmount] = useState(currentLog ? currentLog.totalAmount : 0);
  const [categories, setCategories] = useState(currentLog ? currentLog.categories : {});
  const [selectedCategory, setSelectedCategory] = useState({});
  
  // Update local state when currentLog changes
  useEffect(() => {
    if (currentLog) {
      setlogTitle(currentLog.logTitle);
      setTotalAmount(currentLog.totalAmount);
      setCategories(currentLog.categories);
      setSelectedCategory({});
    }
  }, [logs, currentLog]);

  // Animation effect for entrance animations
  useEffect(() => {
    // Only run entrance animations if we have a currentLog
    if (!isLoading && currentLog) {
      // Start animations with slight delays for sequence
      Animated.sequence([
        // Fade in the whole screen
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        // Then animate elements in sequence
        Animated.parallel([
          // Header slides down
          Animated.spring(headerAnim, {
            toValue: 0,
            tension: 10,
            friction: 7,
            useNativeDriver: true,
          }),
          // Form slides up with a slight delay
          Animated.timing(formAnim, {
            toValue: 0,
            duration: 600,
            delay: 200,
            useNativeDriver: true,
          }),
          // Category slides up with more delay
          Animated.timing(categoryAnim, {
            toValue: 0,
            duration: 300,
            delay: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [currentLog]); // Re-run when currentLog changes

  // Input states
  const [inputAmount, setInputAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Animation states for category selector
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  // Category selection
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Gradient colors based on theme
  const gradientColors = isDarkMode 
    ? ['#121212', '#1f1f1f', '#2a2a2a'] // Dark theme gradient
    : ['#f0f2f5', '#e2e7f0', '#d4dcea']; // Light theme gradient

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

  // Animation functions for categories expansion
  const expandCategories = () => {
    setCategoriesExpanded(true);
    
    // Start with slide animation from bottom
    slideAnim.setValue(height);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const collapseCategories = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCategoriesExpanded(false);
    });
  };

  // Log the expense
  const handleLogExpense = () => {
    if (!inputAmount || !description || !selectedCategory || !selectedCategory.name) {
      Alert.alert(
        "Missing Information",
        "Please enter an amount, description, and select a category.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Update log
    updateLog(inputAmount, description, selectedCategory.name, new Date());
    // Reset form
    setInputAmount('');
    setDescription('');
    setSelectedCategory({});
  };

  // Clear the form
  const handleClearForm = () => {
    setInputAmount('');
    setDescription('');
    setSelectedCategory({});
  };

  // Show loading indicator while currentLog is being fetched
  if (isLoading && !currentLog) {
    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.loadingContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={{ color: theme.text, marginTop: 20 }}>Loading log data...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Show message when no log is selected
  if (!currentLog) {
    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.noLogContainer, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
          <Ionicons name="document-text-outline" size={80} color={theme.subtext} style={{ marginBottom: 20 }} />
          <Text style={[styles.noLogTitle, { color: theme.text }]}>No Log Selected</Text>
          <Text style={[styles.noLogDescription, { color: theme.subtext, textAlign: 'center', marginBottom: 30 }]}>
            You need to create a log before you can add expenses to it.
          </Text>
          <TouchableOpacity 
            style={[styles.createLogButton, {backgroundColor: theme.purple}]}
            onPress={() => router.replace('/(main)/screen2')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={[styles.logButtonText]}>CREATE A LOG</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View 
        style={[
          styles.contentContainer, 
          { opacity: fadeAnim } // Fade in the entire content
        ]}
      >
        {/* Header Card with Trip Name and Amount */}
        <Animated.View 
          style={{ 
            transform: [{ translateY: headerAnim }],  // Slide down from top
          }}
        >
          <LinearGradient
            colors={theme.gradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.headerContent}>
              <Text style={[styles.logTitle, {color: "#FFF"}]}>{logTitle}</Text>
              <Text style={[styles.totalAmount, {color: "#FFF"}]}>${totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</Text>
              
              <View style={styles.quickCategoryContainer}>
                <TouchableOpacity
                  style={[styles.quickCategoryButton, {backgroundColor: '#42404F' }]}
                  onPress={() => {
                    Alert.alert(
                      "Analytics",
                      "This feature is coming soon.",
                      [{ text: "OK" }]
                    );
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: 10 }}>
                      <Ionicons name="analytics-outline" size={35} color="#999" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickCategoryButton, { backgroundColor: '#42404F' }]}
                  onPress={() => {
                    Alert.alert(
                      "View Chart",
                      "This feature is coming soon.",
                      [{ text: "OK" }]
                    );
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: 10 }}>
                      <Ionicons name="list-outline" size={35} color="#999" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickCategoryButton, { backgroundColor: '#42404F' }]}
                  onPress={() => {
                    Alert.alert(
                      "View Stats",
                      "This feature is coming soon.",
                      [{ text: "OK" }]
                    );
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: 12 }}>
                    <Ionicons name="pie-chart-outline" size={30} color="#999" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickCategoryButton, { backgroundColor: '#42404F' }]}
                  onPress={() => {
                    Alert.alert(
                      "Duplicate Log",
                      "This feature is coming soon.",
                      [{ text: "OK" }]
                    );
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: 10 }}>
                      <Ionicons name="duplicate-outline" size={35} color="#999" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
        
        {/* Input Form - slides up from bottom */}
        <Animated.View 
          style={{
            transform: [{ translateY: formAnim }] // Slide up from bottom
          }}
        >
          <View style={[styles.formContainer, {backgroundColor: theme.card}]}>
            {/* Row 1: Amount and Category side by side */}
            <View style={{flexDirection: 'row', height: 90}}>
              {/* Amount Input */}
              <View style={{flex: 0.75}}>
                <Text style={[styles.inputLabel, {color: theme.text}]}>AMOUNT</Text>
                <View style={[styles.amountContainer, {backgroundColor: theme.background}]}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={[styles.amountInput, {color: theme.text}]}
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
                <Text style={[styles.inputLabel, {color: theme.text}]}>CATEGORY</Text>
                <TouchableOpacity 
                  style={[styles.categorySelector, {backgroundColor: theme.background}]}
                  onPress={openCategoryModal}
                >
                  <Text style={[styles.categorySelectorText, {color: theme.subtext}]}>
                    {selectedCategory.name || "Select Category"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Row 2: Description Input */}
            <View style={styles.inputSection}>
              <Text style={[styles.inputLabel, {color: theme.text}]}>DESCRIPTION</Text>
              <TextInput
                style={[styles.descriptionInput, {backgroundColor: theme.background, color: theme.text}]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
                placeholderTextColor="#666"
                multiline={false}
              />
            </View>
            
            {/* Row 3: Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.clearButton, {backgroundColor: theme.card, borderWidth: 1, borderColor: theme.red}]}
                onPress={handleClearForm}
              >
                <Text style={[styles.clearButtonText, {color: theme.red}]}>CLEAR</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.logButton, {backgroundColor: theme.purple}]}
                onPress={handleLogExpense}
              >
                <Text style={[styles.logButtonText]}>LOG</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        
        {/* Bottom Categories Section - slides up with delay */}
        <Animated.View 
          style={[
            styles.categoriesContainer,
            { transform: [{ translateY: categoryAnim }] } // Slide up from bottom with delay
          ]}
        >
          <TouchableOpacity 
            style={[styles.categoryCard, {backgroundColor: theme.card}]}
            onPress={expandCategories}
          >
            <View style={[styles.categoryIcon, { backgroundColor: '#5C5CFF' }]} />
            
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, {color: theme.text}]}>{currentLog.categories[0].name}</Text>
              <Text style={[styles.transactionCount, {color: theme.subtext}]}>{currentLog.categories[0].transactionCount} transactions</Text>
            </View>
            
            <View style={styles.categoryAmount}>
              <Text style={[styles.amountText, {color: theme.text}]}>${currentLog.categories[0].amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2})}</Text>
              <Text style={[styles.percentageText, {color: theme.subtext}]}>{currentLog.categories[0].percentage}%</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Category Selection Modal */}
        <CategorySelectorModal
          visible={categoryModalVisible}
          onClose={closeCategoryModal}
          onSelect={handleCategorySelect}
          categories={categories}
        />
        
        {/* Categories Expansion Modal */}
        {categoriesExpanded && (
          <View style={styles.expandedModalContainer}>
            <TouchableOpacity
              style={styles.expandedDismissArea}
              activeOpacity={1}
              onPress={collapseCategories}
            />
            
            <Animated.View
              style={[
                styles.expandedCategoriesContainer,
                { backgroundColor: theme.card, transform: [{ translateY: slideAnim }] }
              ]}
            >
              <View style={styles.expandedHeader}>
                <View style={styles.expandedHandleBar} />
                <Text style={[styles.expandedTitle, {color: theme.text}]}>Categories</Text>
              </View>
              
              <ScrollView style={styles.expandedScrollView}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.expandedCategoryItem}
                    onPress={() => {
                      setSelectedCategory(category);
                      collapseCategories();
                    }}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color || '#5C5CFF' }]} />
                    
                    <View style={styles.categoryInfo}>
                      <Text style={[styles.categoryName, {color: theme.text}]}>{category.name}</Text>
                      <Text style={[styles.transactionCount, {color: theme.subtext}]}>
                        {currentLog.categories.find(c => c.name === category.name)?.transactionCount || 0} transactions
                      </Text>
                    </View>
                    
                    <View style={styles.categoryAmount}>
                      <Text style={[styles.amountText, {color: theme.text}]}>${category.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2})}</Text>
                      <Text style={[styles.percentageText, {color: theme.subtext}]}>{category.percentage}%</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TouchableOpacity
                style={[styles.closeButton, {borderWidth: 1, borderColor: theme.red, backgroundColor: theme.card}]}
                onPress={collapseCategories}
              >
                <Text style={[styles.closeButtonText, {color: theme.red}]}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  noLogContainer: {
    flex: 1,
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
    height: 220,
    overflow: 'hidden',
  },
  headerContent: {
    padding: 24,
    paddingBottom: 16,
  },
  logTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    shadowColor: "#080808",
    shadowOpacity: .5,
    shadowRadius: 1,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    shadowOpacity: .5,
    shadowRadius: 1,
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
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
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
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 46,
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
  },
  categorySelector: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flex: 0.5,
    justifyContent: 'center',
  },
  categorySelectorText: {
    fontSize: 16,
  },
  descriptionInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  clearButton: {
    flex: 0.75,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  clearButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  logButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  // Categories Section
  categoriesContainer: {
    marginHorizontal: 16,
    marginTop: 60,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 56,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 6,
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
  },
  transactionCount: {
    fontSize: 14,
    marginTop: 4,
  },
  categoryAmount: {
    alignItems: 'flex-end',
    marginRight: 8
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 14,
    marginTop: 2,
  },
  // Expanded Categories Modal
  expandedModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  expandedDismissArea: {
    flex: 1,
  },
  expandedCategoriesContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: height * 0.7,
    width: '100%',
  },
  expandedHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  expandedHandleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#999',
    borderRadius: 3,
    marginBottom: 12,
  },
  expandedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expandedScrollView: {
    padding: 16,
    maxHeight: height * 0.5,
  },
  expandedCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  closeButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  // If !currentLog
  noLogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noLogDescription: {
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 300,
  },
  createLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5C5CFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
    height: 56,
    marginTop: 20,
  }
});