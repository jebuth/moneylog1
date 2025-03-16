import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  //SafeAreaView,
  Platform,
  Dimensions,
  Animated,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context"
import { useAuth } from '../../contexts/AuthContext';
import {useTheme} from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import CategorySelectorModal from '../../components/CategorySelectorModal';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


const { width, height } = Dimensions.get('window');

export default function ExpenseTracker() {
  const { user, logs, currentLog, updateLog, isLoading } = useAuth();
  const {theme} = useTheme();
  const router = useRouter();
  
  // Trip information
  // Trip information - now from currentLog
  const [logTitle, setlogTitle] = useState(currentLog ? currentLog.logTitle : 'New Trip');
  const [totalAmount, setTotalAmount] = useState(currentLog ? currentLog.totalAmount : 0);
  const [categories, setCategories ]= useState(currentLog? currentLog.categories : {});
  // const [selectedCategory, setSelectedCategory] = useState({ 
  //   id: 2, 
  //   name: 'Transportation', 
  //   amount: 330, 
  //   percentage: 5, 
  //   transactions: 2,
  //   color: '#5C5CFF' 
  // });
  const [selectedCategory, setSelectedCategory] = useState({ });
  
  // Update local state when currentLog changes
  useEffect(() => {
    
    if (currentLog) {
      setlogTitle(currentLog.logTitle);
      setTotalAmount(currentLog.totalAmount);
      setCategories(currentLog.categories)
      setSelectedCategory({})
    }

    console.log('useEffect in screen1.jsx with logs, currentLog dependencies')
    console.log('screen1: isLoading: ' + isLoading)
    console.log('screen1: currentLog: ' + JSON.stringify(currentLog))
    console.log('screen1: logs: ' + JSON.stringify(logs))
    //router.replace('/(main)/screen2');
  }, [logs, currentLog]);

  // If no current log, redirect to screen2 (logs list)
  // useEffect(() => {
  //   if (!currentLog) {
  //     router.replace('/(main)/screen2');
  //   }
  // }, [currentLog, router]);

  // Input states
  //const [inputAmount, setInputAmount] = useState('320.33');
  const [inputAmount, setInputAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Animation states
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  // Category selection
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

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
    // Here you would typically save the expense to your backend
    alert(`Logged $${inputAmount} for ${description} in ${selectedCategory.name}`);
    
    // here!
    updateLog(inputAmount, description, selectedCategory.name, new Date())
    // Reset form
    setInputAmount('');
    setDescription('');
    setSelectedCategory({});
  };

  // Clear the form
  const handleClearForm = () => {
    setInputAmount('');
    setDescription('');
  };

  // Show loading indicator while currentLog is being fetched
  if (isLoading && !currentLog) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={{ color: theme.text, marginTop: 20 }}>Loading log data...</Text>
      </View>
    );
  }

  // Show message when no log is selected
  if (!currentLog) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="document-text-outline" size={80} color={theme.subtext} style={{ marginBottom: 20 }} />
        <Text style={[styles.noLogTitle, { color: theme.text }]}>No Log Selected</Text>
        <Text style={[styles.noLogDescription, { color: theme.subtext, textAlign: 'center', marginBottom: 30 }]}>
          You need to create a log before you can add expenses to it.
        </Text>
        <TouchableOpacity 
          style={[styles.createLogButton, {backgroundColor: theme.purple}]}
          //style={[styles.logButton, {backgroundColor: theme.purple, paddingHorizontal: 30}]}
          onPress={() => router.replace('/(main)/screen2')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={[styles.logButtonText]}>CREATE A LOG</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <>
      {/* Header Card with Trip Name and Amount */}
      <View style={[styles.container, {backgroundColor: theme.background}]}>
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
                  "View Analytics",  // Title
                  "This feature is not yet available.",  // Message
                  [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                  ]
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
                  "View Chart",  // Title
                  "This feature is not yet available.",  // Message
                  [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                  ]
                );
              }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: 8 }}>
                    <Ionicons name="pie-chart-outline" size={35} color="#999" />
                </View>
              </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCategoryButton, { backgroundColor: '#42404F' }]}
              onPress={() => {
                Alert.alert(
                  "View Stats",  // Title
                  "This feature is not yet available.",  // Message
                  [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                  ]
                );
              }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: 10 }}>
                  <Ionicons name="stats-chart-outline" size={30} color="#999" />
                </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickCategoryButton, { backgroundColor: '#42404F' }]}
              onPress={() => {
                Alert.alert(
                  "Duplcate Log",  // Title
                  "This feature is not yet available.",  // Message
                  [
                    { text: "OK", onPress: () => console.log("OK Pressed") }
                  ]
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
      
      {/* Input Form */}
      <View style={[styles.formContainer, {backgroundColor: theme.card}]}>
        {/* Row 1: Amount and Category side by side */}
        <View style={{flexDirection: 'row', height: 90}}>
          {/* Amount Input */}
          <View style={{flex: 0.75}}>
            <Text style={[styles.inputLabel, {color: theme.text}]}>AMOUNT</Text>
            <View style={[styles.amountContainer, {backgroundColor: theme.background}]}>
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
            <Text style={[styles.inputLabel, {color: theme.text}]}>CATEGORY</Text>
            <TouchableOpacity 
              style={[styles.categorySelector, {backgroundColor: theme.background}]}
              onPress={openCategoryModal}
            >
              <Text style={[styles.categorySelectorText, {backgroundColor: theme.background}]}>
                {selectedCategory ? selectedCategory.name : "Select Category"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Row 2: Description Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, {color: theme.text}]}>DESCRIPTION</Text>
          <TextInput
            style={[styles.descriptionInput, {backgroundColor: theme.background}]}
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
      
      {/* Bottom Categories Section */}
      <View style={[styles.categoriesContainer]}>
        <TouchableOpacity 
          style={[styles.categoryCard, {backgroundColor: theme.card, zIndex: 0}]}
          onPress={expandCategories}
        >
          <View style={[styles.categoryIcon, { backgroundColor: '#5C5CFF' }]} />
          
          <View style={[styles.categoryInfo, {zIndex: 0}]}>
            <Text style={[styles.categoryName, {color: theme.text, zIndex: 0}]}>{currentLog.categories[0].name}</Text>
            <Text style={[styles.transactionCount, {color: theme.subtext, zIndex: 0}]}>{currentLog.categories[0].transactionCount} transactions</Text>
          </View>
          
          <View style={styles.categoryAmount}>
            <Text style={[styles.amountText, {color: theme.text}]}>${currentLog.categories[0].amount}</Text>
            <Text style={[styles.percentageText, {color: theme.subtext}]}>{currentLog.categories[0].percentage}%</Text>
          </View>
        {/* </TouchableOpacity> */}
        
        {/* Stacked category effects */}
        {/* <View style={[styles.mockCategoriesContainer]}>
          <View style={[styles.mockCategoryCard, { backgroundColor: theme.backgroundShadow1, top: 60, opacity: 1, marginLeft: 5, marginRight: 5, zIndex: -10, boxShadow: "0 3px 1px -1px rgba(8, 8, 8, 0.2)"}]} />
          <View style={[styles.mockCategoryCard, { backgroundColor: theme.backgroundShadow2, top: 70, opacity: 1, marginLeft: 20, marginRight: 20, zIndex: -20, boxShadow: "0 3px 1px -1px rgba(8, 8, 8, 0.3)"}]} />
        </View> */}
        </TouchableOpacity>
      </View>
      
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
            style={[styles.expandedCategoriesContainer,{ backgroundColor: theme.card, transform: [{ translateY: slideAnim }] }
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
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]} />
                  
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, {color: theme.text}]}>{category.name}</Text>
                    <Text style={[styles.transactionCount, {color: theme.subtext}]}>{currentLog.categories.find(c => c.name === category.name).transactionCount} transactions</Text>
                  </View>
                  
                  <View style={styles.categoryAmount}>
                    <Text style={[styles.amountText, {color: theme.text}]}>${category.amount}</Text>
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
    
    </View>
    {/* </SafeAreaView>  */}
    </>    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
    // borderWidth: 2,
    // borderColor: "pink"
    
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
    height: 220,
    overflow: 'hidden',
    //boxShadow: "0 4px 1px -1px rgba(8, 8, 8, 0.3)"
    // here!
    // shadowOpacity: .5,
    // shadowRadius: 1,
  },
  headerContent: {
    padding: 24,
    paddingBottom: 16,
    //boxShadow: "0 4px 1px -1px rgba(8, 8, 8, 0.3)"
    // shadowColor: "#080808",
    // shadowOpacity: .5,
    // shadowRadius: 1,
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
    backgroundColor: '#1D1D1D', // Dark gray background
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 4px 1px -1px rgba(8, 8, 8, 0.3)"
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
    color: '#999',
  },
  categorySelector: {
    padding: 12,
    backgroundColor: '#1D1D1D',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    flex: 0.5,
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
    
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  clearButtonText: {
    color: '#999',
    fontWeight: '600',
    fontSize: 16,
  },
  logButton: {
    flex: 1,
    //backgroundColor: '#5749C5',
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
    //zIndex: 10,
    // shadowColor: "#080808",
    // shadowOpacity: 1,
    // shadowRadius: 2,
    //shadowOffset: 10
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 56,
    backgroundColor: '#1D1D1D',
    marginBottom: 10,
    //zIndex: 10,
    //shadowColor: "#080808",
    //shadowOpacity: 1,
    // shadowRadius: 2,
    boxShadow: "0 4px 1px -1px rgba(8, 8, 8, 0.3)"
    // here! set shadow position
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
    bottom: 60,
    left: 16,
    right: 16,
    height: 25,
    //zIndex: 1,
    shadowColor: "#080808",
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  mockCategoryCard: {
    position: 'absolute',
    height: 25,
    left: 0,
    right: 0,
    backgroundColor: '#1D1D1D',
    borderRadius: 50,
    //zIndex: 1,
  },
  
  // Expanded Categories Modal
  expandedModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    //backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    shadowColor: '',
    //zIndex: 1000,
  },
  expandedDismissArea: {
    flex: 1,
  },
  expandedCategoriesContainer: {
    backgroundColor: '#1D1D1D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30, // Add padding for the home indicator
    maxHeight: height * 0.7, // Limit the modal height
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
    color: '#FFF',
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
    backgroundColor: '#2A2A2A',
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // if !currentLog
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
    width: '80%',         // Set width to a percentage of the screen
    maxWidth: 300,        // Maximum width
    height: 56,           // Fixed height
    marginTop: 20,        // Give some spacing from the text
  }
});