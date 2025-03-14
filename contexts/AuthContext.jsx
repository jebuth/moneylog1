import React, { createContext, useState, useContext, useEffect } from 'react';
import { router } from 'expo-router';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
// Import configurations
import { firebaseConfig, googleAuthConfig } from '../config/firebase';

// Initialize Firebase app

// console.log(firebaseConfig)
// console.log(googleAuthConfig)setcurr
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Create the authentication context
const AuthContext = createContext();

// Hook to use the authentication context
export function useAuth() {
  return useContext(AuthContext);
}

// Authentication provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Google Auth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Platform.OS === 'ios' ? googleAuthConfig.iosClientId : (Platform.OS === 'android' ? ANDROID_CLIENT_ID : WEB_CLIENT_ID),
    //androidClientId: ANDROID_CLIENT_ID,
    iosClientId:googleAuthConfig.iosClientId
    //webClientId: WEB_CLIENT_ID,
    //expoClientId: WEB_CLIENT_ID,
  });

  // Handle the Google sign-in response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    } else if (response?.type === 'error') {
      setError(response.error || 'Google sign-in failed');
    }
  }, [response]);

  // Handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        // Convert Firebase user to your app's user format
        const appUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL,
          preferences: {
            theme: 'light',
            notifications: true
          },
          data: {
            items: [
              { id: 1, name: 'Item 1' },
              { id: 2, name: 'Item 2' },
              { id: 3, name: 'Item 3' }
            ]
          }
        };
        
        // Save user in state
        setUser(appUser);
        
        // Save user to AsyncStorage
        saveUserToStorage(appUser);
      } else {
        // User is signed out
        setUser(null);
        AsyncStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    // Check for stored user credentials
    const checkLoginStatus = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        // Firebase's onAuthStateChanged will set isLoading to false
      }
    };

    checkLoginStatus();

    // Cleanup the observer on unmount
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    // Set the first log as current when component mounts
    if (logs.length > 0 && !currentLog) {
      setCurrentLog(logs[0]);
    }
  }, []);


  // Save user data to AsyncStorage
  const saveUserToStorage = async (userData) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(main)/screen1');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
      return { 
        success: false, 
        error: error.message || 'Failed to login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign In
  const handleGoogleSignIn = async (idToken) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a credential from the Google ID token
      const credential = GoogleAuthProvider.credential(idToken);
      
      // Sign in to Firebase with the Google credential
      const userCredential = await signInWithCredential(auth, credential);
      
      // Navigate to main app
      router.replace('/(main)/screen1');
      return { success: true };
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Failed to sign in with Google');
      return {
        success: false,
        error: error.message || 'Failed to sign in with Google'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Start Google sign-in process
  const signInWithGoogle = async () => {
    try {
      return await promptAsync();
    } catch (error) {
      setError('Failed to start Google sign-in');
      return { success: false, error: 'Failed to start Google sign-in' };
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signOut(auth);
      router.replace('/(auth)');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message || 'Failed to logout');
      return { 
        success: false, 
        error: error.message || 'Failed to logout' 
      };
    } finally {
      setIsLoading(false);
    }
  };


    // crud
    // State for the current log
    const [currentLog, setCurrentLog] = useState(null);
  
    // State for all logs
    const [logs, setLogs] = useState([
      { 
        id: '1', 
        tripName: 'Mexico Trip 2024', 
        totalAmount: 23624.69, 
        date: '2024-03-01',
        categories: [
          {
            id: 1,
            name: "Transportationia",
            amount: 666.66,
            percentage: 50,
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 2,
            name: "Food",
            amount: 666.66,
            percentage: 50,
            transactionCount: 6,
            color: '#3F339F'

          },
          {
            id: 3,
            name: "Groceries",
            amount: 666.66,
            percentage: 50,
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 4,
            name: "Utilities",
            amount: 666.66,
            percentage: 50,
            
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 5,
            name: "Gifts",
            amount: 666.66,
            percentage: 50,
            
            transactionCount: 6,
            color: '#3F339F'
          },

        ],
        transactions: []
      },
      { 
        id: '2', 
        tripName: 'Japan Vacation', 
        totalAmount: 15420.50, 
        date: '2023-11-15',
        categories: [
          {
            id: 1,
            name: "Densha",
            amount: 666.66,
            percentage: 50,
            
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 2,
            name: "Food",
            amount: 666.66,
            percentage: 50,
            
            transactionCount: 6,
            color: '#3F339F'

          },
          {
            id: 3,
            name: "Groceries",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 4,
            name: "Utilities",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 5,
            name: "Gifts",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },

        ],
        transactions: []
        
        
      },
      { 
        id: '3', 
        tripName: 'Business Trip NYC', 
        totalAmount: 4850.75, 
        date: '2023-09-22',
        categories: [
          {
            id: 1,
            name: "NYC subways",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 2,
            name: "Food",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'

          },
          {
            id: 3,
            name: "Groceries",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 4,
            name: "Utilities",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 5,
            name: "Gifts",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },

        ],
        transactions: []
      },
      { 
        id: '4', 
        tripName: 'Europe Tour', 
        totalAmount: 32150.00, 
        date: '2023-07-10',
        categories: [
          {
            id: 1,
            name: "Trollies",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 2,
            name: "Food",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'

          },
          {
            id: 3,
            name: "Groceries",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 4,
            name: "Utilities",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 5,
            name: "Gifts",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },

        ],
        transactions: []
      },
      { 
        id: '5', 
        tripName: 'Weekend Getaway', 
        totalAmount: 1250.30, 
        date: '2023-05-05',
        categories: [
          {
            id: 1,
            name: "Ubers",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 2,
            name: "Food",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'

          },
          {
            id: 3,
            name: "Groceries",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 4,
            name: "Utilities",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },
          {
            id: 5,
            name: "Gifts",
            amount: 666.66,
            percentage: 50,
            transactions: [],
            transactionCount: 6,
            color: '#3F339F'
          },

        ],
        transactions: []
      },
    ]);
    
    // Add a log
    const addLog = (log) => {
      setLogs([log, ...logs]);
    };
    
    // Update a log
    // const updateLog = (updatedLog) => {
    //   // const updatedLogs = logs.map(log => 
    //   //   log.id === updatedLog.id ? updatedLog : log
    //   // );
    //   // setLogs(updatedLogs);
      
    //   // Also update currentLog if it's the one being updated
    //   if (currentLog && currentLog.id === updatedLog.id) {
    //     setCurrentLog(updatedLog);
    //   }
    // };
    const updateLog = (amount, description, categoryName, date) => {
      
      amount = toFixedNumber(amount, 2);
      
      // Create a new transaction object with a unique ID
      let newTransaction = {
        id: Date.now().toString(),
        amount,
        description,
        category: categoryName,
        date
      };
    
      if (!currentLog) {
        console.error("No current log selected");
        return;
      }
    
      // Create a deep copy of the current log to avoid direct state mutation
      const updatedLog = { ...currentLog };
      
      // Add newTransaction to the currentLog.transactions
      updatedLog.transactions = [...(updatedLog.transactions || []), newTransaction];
      
      // Update the total amount of the log - ensure it exists and is a number
      const currentAmount = typeof updatedLog.totalAmount === 'number' ? updatedLog.totalAmount : 0;
      updatedLog.totalAmount = parseFloat((currentAmount + amount).toFixed(2));
      
      // Update currentLog.categories with the newTransaction
      if (updatedLog.categories && updatedLog.categories.length > 0) {
        updatedLog.categories = updatedLog.categories.map(category => {
          // If this is the category for the new transaction
          if (category.name === categoryName) {
            const categoryAmount = typeof category.amount === 'number' ? category.amount : 0;
            return {
              ...category,
              // Increase the amount for this category
              amount: parseFloat((categoryAmount + amount).toFixed(2)),
              // amount: parseFloat((categoryAmount + 10).toFixed(2)),
              // Increment transaction count
              transactionCount: (category.transactionCount || 0) + 1,
              // Add the transaction to the category's transactions array if it exists
              //transactions: [...(category.transactions || []), newTransaction]
              //transactions: [...(category.transactions || []), [{newTransaction}]]
            };
          }
          return category;
        });
        
        // Recalculate percentages for all categories
        const totalLogAmount = updatedLog.totalAmount;
        if (totalLogAmount > 0) {
          updatedLog.categories = updatedLog.categories.map(category => ({
            ...category,
            percentage: Math.round(((category.amount || 0) / totalLogAmount) * 100)
          }));
        }
      }
      
      // Update logs array with the modified log
      const updatedLogs = logs.map(log => 
        log.id === updatedLog.id ? updatedLog : log
      );
      
      // Update both states
      setLogs(updatedLogs);
      setCurrentLog(updatedLog);
    };
    
    // Delete a log
    const deleteLog = (logId) => {
      setLogs(logs.filter(log => log.id !== logId));
      
      // If deleted log is current log, clear currentLog. what to display on screen1?
      if (currentLog && currentLog.id === logId) {
        setCurrentLog(null);
      }
    };


    // ensure variables are number format decimals
    function toFixedNumber(value, decimals = 2) {
      // Handle different input types
      if (value === null || value === undefined) {
        return 0.00;
      }
      
      // Convert strings, numbers, etc. to a number
      const num = Number(value);
      
      // Check if conversion resulted in a valid number
      if (isNaN(num)) {
        return 0.00;
      }
      
      // Convert to string with fixed decimals, then back to number
      return parseFloat(num.toFixed(decimals));
    }

  // Provide auth context to child components
  return (
    <AuthContext.Provider value={{
      // authentication
      user,
      isLoading,
      error,
      login,
      logout,
      signInWithGoogle,
      isAuthenticated: !!user,

      // firestore crud
      logs, 
      setLogs, 
      currentLog,
      setCurrentLog,
      addLog,
      updateLog,
      deleteLog

    }}>
      {children}
    </AuthContext.Provider>
  );
}