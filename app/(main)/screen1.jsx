import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import CategorySelectorModal from '../../components/CategorySelectorModal';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {CategoryIcons} from '../../constants/CategoryIcons';

const { width, height } = Dimensions.get('window');

export default function ExpenseTracker() {
  const { user, logs, currentLog, updateLog, isLoading } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  
  // Trip information from currentLog
  const [logTitle, setlogTitle] = useState(currentLog ? currentLog.logTitle : 'New Trip');
  const [totalAmount, setTotalAmount] = useState(currentLog ? currentLog.totalAmount : 0);
  const [categories, setCategories] = useState(currentLog ? currentLog.categories : {});
  const [selectedCategory, setSelectedCategory] = useState({});
  
  // Update local state when currentLog changes
  useEffect(() => {
    console.log('loginScreen useEffect')
    console.log('currentLog:', currentLog)
    if (currentLog) {
      setlogTitle(currentLog.logTitle);
      setTotalAmount(currentLog.totalAmount);
      setCategories(currentLog.categories);
      setSelectedCategory({});
    }
  }, [logs, currentLog]);

  // Input states
  const [inputAmount, setInputAmount] = useState('');
  const [description, setDescription] = useState('');
  
  // Category selection
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Handle amount input changes
  const handleAmountChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      setInputAmount('');
      return;
    }
    
    const cents = parseInt(numericValue);
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
    
    updateLog(inputAmount, description, selectedCategory.name, new Date());
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
        colors={theme.backgroundGradient}
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
        colors={theme.backgroundGradient}
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
      colors={theme.backgroundGradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card with Trip Name and Amount */}
        <LinearGradient
          colors={theme.cardGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <View style={styles.headerContent}>
            <Text style={[styles.logTitle, {color: theme.text}]}>{logTitle}</Text>
            <Text style={[styles.totalAmount, {color: theme.text}]}>${totalAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}</Text>
            
            <View style={styles.quickCategoryContainer}>
              <TouchableOpacity
                style={[styles.quickCategoryButton, {backgroundColor: theme.purple }]}
                onPress={() => Alert.alert("Analytics", "This feature is coming soon.", [{ text: "OK" }])}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: 10 }}>
                  <Ionicons name="analytics-outline" size={35} color='#DDD' />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickCategoryButton, { backgroundColor: theme.purple }]}
                onPress={() => Alert.alert("View Chart", "This feature is coming soon.", [{ text: "OK" }])}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: 10 }}>
                  <Ionicons name="list-outline" size={35} color="#DDD" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickCategoryButton, { backgroundColor: theme.purple }]}
                onPress={() => Alert.alert("View Stats", "This feature is coming soon.", [{ text: "OK" }])}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: 12 }}>
                  <Ionicons name="pie-chart-outline" size={30} color="#DDD" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickCategoryButton, { backgroundColor: theme.purple }]}
                onPress={() => Alert.alert("Duplicate Log", "This feature is coming soon.", [{ text: "OK" }])}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', top: 10 }}>
                  <Ionicons name="duplicate-outline" size={35} color="#DDD" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
        
        {/* Input Form */}
        <LinearGradient 
          colors={theme.cardGradient}
          style={styles.formContainer}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
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
        </LinearGradient>
        
        {/* Categories List Card */}
        <LinearGradient
          colors={theme.cardGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoriesCard}
        >
          <View style={styles.categoriesList}>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    index === categories.length - 1 && styles.lastCategoryItem
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >

                  <Ionicons name={CategoryIcons[category.name]} size={24} color={theme.subtext} style={styles.categoryIcon} />
                                    
                  <View style={styles.categoryInfo}>
                    <Text style={[styles.categoryName, {color: theme.text}]}>{category.name}</Text>
                    <Text style={[styles.transactionCount, {color: theme.subtext}]}>
                      {category.transactionCount} transactions
                    </Text>
                  </View>
                  
                  <View style={styles.categoryAmount}>
                    <Text style={[styles.amountText, {color: theme.text}]}>
                      ${category.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </Text>
                    <Text style={[styles.percentageText, {color: theme.subtext}]}>
                      {category.percentage}%
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyCategories}>
                <Text style={[styles.emptyCategoriesText, {color: theme.subtext}]}>
                  No categories available
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
        
        {/* Category Selection Modal */}
        <CategorySelectorModal
          visible={categoryModalVisible}
          onClose={closeCategoryModal}
          onSelect={handleCategorySelect}
          categories={categories}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
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
    borderColor: '#68a8d4',
    borderWidth: .2,
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
    width: 58,
    height: 58,
    borderRadius: 29,
    marginHorizontal: 10,
  },
  formContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    borderColor: '#68a8d4',
    borderWidth: .2,
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
  categoriesCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    borderColor: '#68a8d4',
    borderWidth: .2,
  },
  categoriesHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoriesSubtitle: {
    fontSize: 14,
  },
  categoriesList: {
    // Container for all category items
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastCategoryItem: {
    borderBottomWidth: 0,
  },
  categoryIcon: {
    // width: 40,
    // height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionCount: {
    fontSize: 13,
    marginTop: 2,
  },
  categoryAmount: {
    alignItems: 'flex-end',
    marginRight: 8
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  percentageText: {
    fontSize: 13,
    marginTop: 2,
  },
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