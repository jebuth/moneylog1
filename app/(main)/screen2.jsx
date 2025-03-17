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
  const {theme} = useTheme();
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
  const [newLogAmount, setNewLogAmount] = useState('');
  
  // State for handling animated deletion
  const [itemBeingDeleted, setItemBeingDeleted] = useState(null);
  
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
  //const filteredLogs = logs.filter(log => log.logTitle.toLowerCase().includes(searchQuery.toLowerCase()))

  // Filtered logs based on search query
const filteredLogs = logs.filter(log => 
  log && log.logTitle && log.logTitle.toLowerCase().includes(searchQuery.toLowerCase())
);
    // Filtered logs based on search query
// const filteredLogs = Array.isArray(logs) && logs.length > 0
// ? logs.filter(log => log && log.tripName && log.tripName.toLowerCase().includes(searchQuery.toLowerCase()))
// : [];
  
  // Close any open swipeable
  const closeOpenSwipeable = useCallback(() => {
    if (openSwipeableId && swipeableRefs.current[openSwipeableId]) {
      swipeableRefs.current[openSwipeableId].close();
      setOpenSwipeableId(null);
    }
  }, [openSwipeableId]);
  
  // Navigate to expense screen with the selected log
  // const navigateToExpenseScreen = useCallback((log) => {
  //   // Close any open swipeable
  //   closeOpenSwipeable();
  //   // Set the current log in context
  //   setCurrentLog(log);
  //   // Navigate to screen1
  //   navigation.navigate('screen1');
  // }, [closeOpenSwipeable, navigation, setCurrentLog]);
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
    if (newLogName.trim() === '' || newLogAmount.trim() === '') {
      alert('Enter both a log title and starting amount');
      return;
    }
    
    const amount = parseFloat(newLogAmount.replace(/[^0-9.]/g, ''));
    
    if (isNaN(amount)) {
      alert('Enter a valid amount');
      return;
    }

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
    
    // console.log('SCREEN2 addedLog')
    // console.log(JSON.stringify(addedLog));

    //setCurrentLog(addedLog);

    setLogs([addedLog, ...logs]);
    setSearchQuery('')
    setShowNewLogModal(false);
    setNewLogName('');
    setNewLogAmount('');
    
    // Navigate to the log detail screen with the new log
    //navigateToExpenseScreen(logData);
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
            // here!
            await deleteLog(logId)
            // Animate the item sliding away
            slideOutAnim.setValue(0);
            Animated.timing(slideOutAnim, {
              toValue: -width,
              duration: 400,
              useNativeDriver: true
            }).start(() => {
              // After animation completes, remove the item
              //configureLayoutAnimation();
              setLogs(logs.filter(log => log.id !== logId));
              setOpenSwipeableId(null);
              setItemBeingDeleted(null);
              //slideOutAnim.setValue(0);
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
  const handleAmountChange = (text) => {
    // Remove all non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    
    if (numericValue === '') {
      setNewLogAmount('');
      return;
    }
    
    // Convert to cents (e.g., "234" becomes "2.34")
    const cents = parseInt(numericValue);
    
    // Format with commas and two decimal places
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
    
    setNewLogAmount(formattedAmount);
  };
  
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
    // If this item is being deleted, apply the slide animation
    const isBeingDeleted = item.id === itemBeingDeleted;
    
    //console.log("rendering log item: ", item.logTitle, item.id)
    //console.log("rendering log item: ", item)
    //console.log('Complete log structure:', JSON.stringify(item, null, 2));

    // Animation style when being deleted
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
            // Close any previously opened swipeable
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
              // Navigate to this log
              navigateToExpenseScreen(item);
            }}
            onLayout={(event) => {
              // Store the height of each item for animation
              const { height } = event.nativeEvent.layout;
              itemHeights.current[item.id] = height;
            }}
          >
            <LinearGradient
              colors={theme.gradient}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logGradient}
            >
              <View style={styles.logContent}>
                <Text style={[styles.logName, {color: '#fff'}]}>{item.logTitle}</Text>
                <Text style={[styles.logAmount, {color: '#fff'}]}>{formatCurrency(item.totalAmount)}</Text>
                <Text style={[styles.logDate, {color: theme.subtext}]}>{item.date}</Text>
                
                <View style={styles.actionsRow}>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => {
                      // Navigate to expense tracking screen with this log
                      navigateToExpenseScreen(item);
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#FFF" />
                    <Text style={styles.iconButtonText}>Add Expense</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => {
                      closeOpenSwipeable();
                      // Navigate to log details/report screen
                      // navigation.navigate('logDetails', { logId: item.id });
                    }}
                  >
                    <Ionicons name="analytics-outline" size={24} color="#FFF" />
                    <Text style={styles.iconButtonText}>View Report</Text>
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
          <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={{ color: theme.text, marginTop: 20 }}>Loading log data...</Text>
          </View>
        );
      }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, {backgroundColor : theme.background}]}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, {color: theme.text}]}>My Logs</Text>
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
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search logs..."
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
          key={`logs-${logs.length}-${theme.isDarkMode}`} // This forces a re-render when logs.length changes
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
            style={[styles.modalContainer, {backgroundColor : "#121212"}]}
          >
            <View style={[styles.modalContent, {backgroundColor: theme.card}]}>
              <View style={styles.modalHandle} />
              
              <Text style={styles.modalTitle}>Create New Log</Text>
              
              <Text style={[styles.inputLabel, {color: theme.subtext}]}>Log Title</Text>
              <TextInput
                style={[styles.modalInput, {backgroundColor: theme.background, color: theme.text}]}
                placeholder="Enter log name"
                placeholderTextColor="#999"
                value={newLogName}
                onChangeText={setNewLogName}
              />
              
              <Text style={[styles.inputLabel, {color : theme.subtext}]}>Initial Budget</Text>
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
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.cancelButton, {backgroundColor: theme.card, borderWidth:1, borderColor: theme.red}]}
                  onPress={() => {
                    setShowNewLogModal(false);
                    setNewLogName('');
                    setNewLogAmount('');
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
    color: '#FFFFFF',
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5C5CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1D1D',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#FFF',
    fontSize: 16,
  },
  clearSearch: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120, // Extra space at bottom
  },
  logItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: '#121212', // Background to avoid transparency when swiping
  },
  logGradient: {
    borderRadius: 16,
  },
  logContent: {
    padding: 16,
  },
  logName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    shadowColor: "#080808",
    shadowOpacity: .5,
    shadowRadius: 1,
  },
  logAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    shadowColor: "#080808",
    shadowOpacity: .5,
    shadowRadius: 1,
  },
  logDate: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
    shadowColor: "#080808",
    shadowOpacity: .1,
    shadowRadius: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 16,
    shadowColor: "#080808",
    shadowOpacity: .5,
    shadowRadius: 1,
  },
  // Delete actions styling
  deleteButtonContainer: {
    width: 100,
    marginBottom: 16,
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
    color: '#999',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1D1D1D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24, // Extra padding for iOS
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
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 24,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 18,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 0.48,
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
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