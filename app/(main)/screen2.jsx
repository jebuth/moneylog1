import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Alert,
  Animated,
  LayoutAnimation,
  UIManager,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LogsListScreen() {
  const { isLoading, user, logs, setLogs, currentLog, setCurrentLog, addLog, deleteLog } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();
  
  // Track currently opened swipeable item
  const [openSwipeableId, setOpenSwipeableId] = useState(null);
  // Map to store references to swipeables
  const swipeableRefs = useRef({});
  // Store item heights for animation
  const itemHeights = useRef({});
  // Animation value for deletion
  const slideOutAnim = useRef(new Animated.Value(0)).current;

  // State for search and new log creation
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewLogModal, setShowNewLogModal] = useState(false);
  const [newLogName, setNewLogName] = useState('');
  //const [newLogAmount, setNewLogAmount] = useState('');
  
  // State for handling animated deletion
  const [itemBeingDeleted, setItemBeingDeleted] = useState(null);
  
  // Gradient colors based on theme
  // app background
  // const gradientColors = isDarkMode 
  // ? ['#12141A', '#1E2028', '#2A2C38']  // Medium contrast
  // : ['#C5CBEB', '#DCE0F4', '#F0F2FA']
  
  // Configure custom animation for list changes
  const configureLayoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  };

  // Filtered logs based on search query
  const filteredLogs = logs.filter(log => 
    log && log.logTitle && log.logTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Close any open swipeable
  const closeOpenSwipeable = useCallback(() => {
    if (openSwipeableId && swipeableRefs.current[openSwipeableId]) {
      swipeableRefs.current[openSwipeableId].close();
      setOpenSwipeableId(null);
    }
  }, [openSwipeableId]);
  
  // Navigate to expense screen with the selected log
  const navigateToExpenseScreen = useCallback((log) => {
    // Close any open swipeable
    closeOpenSwipeable();
    
    if (!log) {
      // Show alert if no log is available
      Alert.alert(
        "No Log Selected",
        "Please create a trip first before adding expenses.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Set the current log in context
    setCurrentLog(log);
    
    // Navigate to screen1
    navigation.navigate('screen1');
  }, [closeOpenSwipeable, navigation, setCurrentLog]);
  
  // Handle creating a new log
  const handleCreateNewLog = async () => {
    // if (newLogName.trim() === '' || newLogAmount.trim() === '') {
    //   alert('Enter both a log title and starting amount');
    //   return;
    // }
    
    if (newLogName.trim() === '') {
      alert('Enter a log title.');
      return;
    }

    //const amount = parseFloat(newLogAmount.replace(/[^0-9.]/g, ''));
    
    // if (isNaN(amount)) {
    //   alert('Enter a valid amount');
    //   return;
    // }

    const logData = {
      userId: user.id,
      logTitle: newLogName,
      totalAmount: 0,
      date: new Date().toISOString().split('T')[0],
      categories: [
        {
          id: 1,
          name: "Restaurants",
          amount: 0,
          percentage: 0,
          transactionCount: 0,
        },
        {
          id: 2,
          name: "Gifts",
          amount: 0,
          percentage: 0,
          transactionCount: 0,
        },
        {
          id: 3,
          name: "Health/Medical",
          amount: 0,
          percentage: 0,
          transactionCount: 0,
        },
        {
          id: 4,
          name: "Home",
          amount: 0,
          percentage: 0,
          transactionCount: 0,
        },
        {
          id: 5,
          name: "Transportation",
          amount: 0,
          percentage: 0,
          transactionCount: 0,
        },
        {
          id: 6,
          name: "Personal",
          amount: 0,
          percentage: 0,
          transactionCount: 0,
        },
        {
          id: 7,
          name: "Pets",
          amount: 0,
          percentage: 0,
          transactionCount: 0,
        },
        {
          id: 8,
          name: "Utilities",
          amount: 0,
          percentage: 0,
          transactionCount: 0,
        },
        {
          id: 9,
          name: "Entertainment",
          amount: 0,
          percentage: 0,
          transactionCount: 0,
        },
        {
          id: 10,
          name: "Groceries",
          amount: 0,
          percentage: 0,
          transactionCount: 0,
        }
      ],
      transactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let addedLog = await addLog(logData);

    // Animate new item
    configureLayoutAnimation();
    
    setLogs([addedLog, ...logs]);
    setSearchQuery('')
    setShowNewLogModal(false);
    setNewLogName('');
    //setNewLogAmount('');
  };
  
  // Handle deleting a log with animation
  const handleDeleteLog = async (logId) => {
    Alert.alert(
      "Delete Log",
      "Are you sure you want to delete this log? This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: async () => {
            setItemBeingDeleted(logId);
            await deleteLog(logId)
            // Animate the item sliding away
            slideOutAnim.setValue(0);
            Animated.timing(slideOutAnim, {
              toValue: -width,
              duration: 400,
              useNativeDriver: true
            }).start(() => {
              // After animation completes, remove the item
              setLogs(logs.filter(log => log.id !== logId));
              setOpenSwipeableId(null);
              setItemBeingDeleted(null);
            });
          },
          style: "destructive"
        }
      ]
    );
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Handle amount input formatting
  // const handleAmountChange = (text) => {
  //   // Remove all non-numeric characters
  //   const numericValue = text.replace(/[^0-9]/g, '');
    
  //   if (numericValue === '') {
  //     //setNewLogAmount('');
  //     return;
  //   }
    
  //   // Convert to cents (e.g., "234" becomes "2.34")
  //   const cents = parseInt(numericValue);
    
  //   // Format with commas and two decimal places
  //   const formattedAmount = new Intl.NumberFormat('en-US', {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   }).format(cents / 100);
    
  //   setNewLogAmount(formattedAmount);
  // };
  
  // Render right actions (delete button) for swipeable
  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });
    
    return (
      <Animated.View 
        style={[
          styles.deleteButtonContainer,
          {
            transform: [{ translateX: trans }],
          }
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteLog(item.id)}
        >
          <Ionicons name="trash-outline" size={24} color="#FFF" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Render individual log item using the proper pattern for React hooks
  const renderLogItem = useCallback(({ item, index }) => {
    const isBeingDeleted = item.id === itemBeingDeleted;
    
    const animatedStyle = isBeingDeleted ? {
      transform: [{ translateX: slideOutAnim }]
    } : {};
    
    return (
      <Animated.View style={animatedStyle}>
        <Swipeable
          ref={ref => {
            if (ref) {
              swipeableRefs.current[item.id] = ref;
            }
          }}
          renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
          onSwipeableOpen={() => {
            if (openSwipeableId && openSwipeableId !== item.id) {
              swipeableRefs.current[openSwipeableId]?.close();
            }
            setOpenSwipeableId(item.id);
          }}
          onSwipeableClose={() => {
            if (openSwipeableId === item.id) {
              setOpenSwipeableId(null);
            }
          }}
          friction={2}
          rightThreshold={40}
        >
          <TouchableOpacity 
            style={styles.logItem}
            onPress={() => {
              navigateToExpenseScreen(item);
            }}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              itemHeights.current[item.id] = height;
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={theme.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.logGradient}
            >
              <View style={styles.logContent}>
                <View style={styles.logHeader}>
                  <View style={styles.logTitleSection}>
                    <Text style={[styles.logName, {color: theme.text}]}>{item.logTitle}</Text>
                    <Text style={[styles.logAmount, {color: theme.text}]}>{formatCurrency(item.totalAmount)}</Text>
                  </View>
                  <Text style={[styles.logDate, {color: theme.text}]}>{item.date}</Text>
                </View>
                
                <View style={styles.actionsRow}>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => {
                      navigateToExpenseScreen(item);
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={theme.text} />
                    <Text style={[styles.iconButtonText, {color:theme.text}]}>Add Expense</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => {
                      closeOpenSwipeable();
                    }}
                  >
                    <Ionicons name="analytics-outline" size={20} color={theme.text} />
                    <Text style={[styles.iconButtonText, {color: theme.text}]}>View Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  }, [openSwipeableId, closeOpenSwipeable, itemBeingDeleted, slideOutAnim, navigateToExpenseScreen, theme]);

  // Show loading indicator while currentLog is being fetched
  if (isLoading) {
    return (
      <LinearGradient
        colors={theme.backgroundGradient}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={{ color: theme.text, marginTop: 20 }}>Loading log data...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={theme.backgroundGradient}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeAreaContainer}>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, {color: theme.text}]}>Logs</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => {
                closeOpenSwipeable();
                setShowNewLogModal(true);
              }}
            >
              <Ionicons name="add" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          {/* Search Bar */}
          <View style={[styles.searchContainer, {backgroundColor: theme.card}]}>
            {/* <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} /> */}
            <TextInput
              style={[styles.searchInput, {color: theme.text}]}
              placeholder="Search"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearSearch}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Logs List */}
          <FlatList
            key={`logs-${logs.length}-${isDarkMode}`} // This forces a re-render when logs.length changes
            data={filteredLogs}
            extraData={[logs, theme]} // FlatList will re-render when logs.length changes
            renderItem={renderLogItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            onScroll={closeOpenSwipeable}
            removeClippedSubviews={false} // Important for animations
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, {color: theme.text}]}>
                  {searchQuery.length > 0 
                    ? "No logs match your search" 
                    : "You haven't created any logs yet..."}
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => setShowNewLogModal(true)}
                >
                  <Text style={[styles.emptyButtonText, {color: '#fff'}]}>Create Your First Log</Text>
                </TouchableOpacity>
              </View>
            }
          />
          
          {/* Create New Log Modal */}
          <Modal
            visible={showNewLogModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowNewLogModal(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContainer}
            >
              <View style={[styles.modalContent, {backgroundColor: theme.card}]}>
                <View style={styles.modalHandle} />
                
                <Text style={[styles.modalTitle, {color: theme.text}]}>Create New Log</Text>
                
                <Text style={[styles.inputLabel, {color: theme.subtext}]}>Log Title</Text>
                <TextInput
                  style={[styles.modalInput, {backgroundColor: theme.background, color: theme.text}]}
                  placeholder="Enter log name"
                  placeholderTextColor="#999"
                  value={newLogName}
                  onChangeText={setNewLogName}
                />
                
                {/* <Text style={[styles.inputLabel, {color: theme.subtext}]}>Initial Budget</Text>
                <View style={[styles.amountInputContainer, {backgroundColor: theme.background}]}>
                  <Text style={[styles.currencySymbol, {color: theme.text}]}>$</Text>
                  <TextInput
                    style={[styles.amountInput, {color: theme.text}]}
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={newLogAmount}
                    onChangeText={handleAmountChange}
                  />
                </View> */}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.cancelButton, {backgroundColor: theme.card, borderWidth:1, borderColor: theme.red}]}
                    onPress={() => {
                      setShowNewLogModal(false);
                      setNewLogName('');
                      //setNewLogAmount('');
                    }}
                  >
                    <Text style={[styles.cancelButtonText, {color: theme.red}]}>CANCEL</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.createLogButton}
                    onPress={handleCreateNewLog}
                  >
                    <Text style={styles.createLogButtonText}>CREATE LOG</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </SafeAreaView>
      </LinearGradient>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5749C5', // purple
    //backgroundColor: '#68a8d4', // light blue
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  clearSearch: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  logItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    //backgroundColor: '#121212',
    borderColor: '#68a8d4', // blue border
    borderWidth: .2,
  },
  logGradient: {
    borderRadius: 16,
  },
  logContent: {
    padding: 14,
  },
  logHeader: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  logTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
    //shadowColor: "#000",
    //shadowOpacity: .1,
    //shadowRadius: 2,
  },
  logAmount: {
    fontSize: 18,
    fontWeight: 'light',
    shadowColor: "#000",
    shadowOpacity: .1,
    shadowRadius: 2,
  },
  logDate: {
    fontSize: 13,
    opacity: 0.8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconButtonText: {
    //color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 14,
    opacity: 0.9,
    shadowColor: "#000",
    //shadowOpacity: .1,
    //shadowRadius: 1,
  },
  deleteButtonContainer: {
    width: 100,
    marginBottom: 12,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#5C5CFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#999',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalInput: {
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 0.48,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  createLogButton: {
    flex: 0.48,
    backgroundColor: '#5C5CFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  createLogButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});