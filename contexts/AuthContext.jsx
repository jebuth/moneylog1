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
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
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

// Initialize Firestore
const db = getFirestore(app);

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

  useEffect(() => {
    // Set the first log as current when logs change
    if (logs.length > 0 && !currentLog) {
      console.log('Setting currentLog from useEffect: logs changed');
      setCurrentLog(logs[0]);
    }
  }, [logs, currentLog]);


  // Handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
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
              items: []
            }
          };
          
          // Save user in state
          setUser(appUser);
          
          // Save user to AsyncStorage
          saveUserToStorage(appUser);

          // Save user to Firestore (add this line)
          await saveUserToFirestore(firebaseUser.uid, appUser);
        
          // Fetch user logs from Firestore
          await fetchUserLogs(firebaseUser.uid);

        } catch (error) {
          console.error('Error handling user authentication:', error);
        }
      } else {
        // User is signed out
        setUser(null);
        setLogs([]);
        setCurrentLog(null);
        AsyncStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    // Cleanup the observer on unmount
    return () => unsubscribe();
  }, []);


  // Add this function to your AuthContext provider
const saveUserToFirestore = async (userId, userData) => {
  try {
    // Reference to the user document
    const userRef = doc(db, 'users', userId);
    
    // Check if user already exists
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // User doesn't exist, create a new document
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('User added to Firestore');
    } else {
      // User exists, update the document
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      console.log('User updated in Firestore');
    }
    
    return true;
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    return false;
  }
};

  // Function to fetch user logs from Firestore
  const fetchUserLogs = async (userId) => {
    try {
      // Set loading state
      setIsLoading(true);
      
      // Query logs collection for documents where userId matches
      const logsRef = collection(db, 'logs');
      const q = query(
        logsRef, 
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Map the Firestore documents to your logs format
      const userLogs = [];
      
      querySnapshot.forEach((doc) => {
        const logData = doc.data();
        userLogs.push({
          id: doc.id,
          logTitle: logData.logTitle,
          totalAmount: logData.totalAmount,
          date: logData.date,
          categories: logData.categories || [],
          transactions: logData.transactions || []
        });
      });
  
      // If no logs exist yet, create initial sample data
      if (userLogs.length === 0) {
        console.log('creating initial log');
        const initialLog = await createInitialLogs(userId);
        userLogs.push(initialLog);
      }
      
      console.log(`Fetched ${userLogs.length} logs for user`);
      
      // Update logs state
      setLogs(userLogs);
      
      // Set current log to the most recent one if available
      if (userLogs.length > 0) {
        console.log('Setting currentLog to:', userLogs[0].logTitle);
        setCurrentLog(userLogs[0]);
      }
      
    } catch (error) {
      console.error('Error fetching user logs:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };



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
  
    const [logs, setLogs] = useState([]);
    // State for all logs
    // const [logs, setLogs] = useState([
    //   { 
    //     id: '1', 
    //     logTitle: 'Mexico Trip 2024', 
    //     totalAmount: 23624.69, 
    //     date: '2024-03-01',
    //     categories: [
    //       {
    //         id: 1,
    //         name: "Transportationia",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 2,
    //         name: "Food",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactionCount: 6,
    //         color: '#3F339F'

    //       },
    //       {
    //         id: 3,
    //         name: "Groceries",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 4,
    //         name: "Utilities",
    //         amount: 666.66,
    //         percentage: 50,
            
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 5,
    //         name: "Gifts",
    //         amount: 666.66,
    //         percentage: 50,
            
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },

    //     ],
    //     transactions: []
    //   },
    //   { 
    //     id: '2', 
    //     logTitle: 'Japan Vacation', 
    //     totalAmount: 15420.50, 
    //     date: '2023-11-15',
    //     categories: [
    //       {
    //         id: 1,
    //         name: "Densha",
    //         amount: 666.66,
    //         percentage: 50,
            
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 2,
    //         name: "Food",
    //         amount: 666.66,
    //         percentage: 50,
            
    //         transactionCount: 6,
    //         color: '#3F339F'

    //       },
    //       {
    //         id: 3,
    //         name: "Groceries",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 4,
    //         name: "Utilities",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 5,
    //         name: "Gifts",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },

    //     ],
    //     transactions: []
        
        
    //   },
    //   { 
    //     id: '3', 
    //     logTitle: 'Business Trip NYC', 
    //     totalAmount: 4850.75, 
    //     date: '2023-09-22',
    //     categories: [
    //       {
    //         id: 1,
    //         name: "NYC subways",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 2,
    //         name: "Food",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'

    //       },
    //       {
    //         id: 3,
    //         name: "Groceries",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 4,
    //         name: "Utilities",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 5,
    //         name: "Gifts",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },

    //     ],
    //     transactions: []
    //   },
    //   { 
    //     id: '4', 
    //     logTitle: 'Europe Tour', 
    //     totalAmount: 32150.00, 
    //     date: '2023-07-10',
    //     categories: [
    //       {
    //         id: 1,
    //         name: "Trollies",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 2,
    //         name: "Food",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'

    //       },
    //       {
    //         id: 3,
    //         name: "Groceries",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 4,
    //         name: "Utilities",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 5,
    //         name: "Gifts",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },

    //     ],
    //     transactions: []
    //   },
    //   { 
    //     id: '5', 
    //     logTitle: 'Weekend Getaway', 
    //     totalAmount: 1250.30, 
    //     date: '2023-05-05',
    //     categories: [
    //       {
    //         id: 1,
    //         name: "Ubers",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 2,
    //         name: "Food",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'

    //       },
    //       {
    //         id: 3,
    //         name: "Groceries",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 4,
    //         name: "Utilities",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },
    //       {
    //         id: 5,
    //         name: "Gifts",
    //         amount: 666.66,
    //         percentage: 50,
    //         transactions: [],
    //         transactionCount: 6,
    //         color: '#3F339F'
    //       },

    //     ],
    //     transactions: []
    //   },
    // ]);



    const createInitialLogs = async (userId) => {
      try {

        // get the current month and year
        // Get current date
        const date = new Date();

        // Method 1: Using toLocaleString
        const monthAndDate = date.toLocaleString('en-US', { 
          month: 'long',
          year: 'numeric'
        });
        

        // Create a sample log
        const sampleLog = {
          userId: userId,
          logTitle: monthAndDate,
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
        
        // Add to Firestore
        const docRef = await addDoc(collection(db, 'logs'), sampleLog);
        
        // Create complete log object with ID
        const newLog = {
          id: docRef.id,
          ...sampleLog
        };
        
        console.log('Created initial log for new user with ID:', docRef.id);
        
        return newLog; // Return the new log object directly
      } catch (error) {
        console.error('Error creating initial logs:', error);
        throw error;
      }
    };

    // Add a log to Firestore
const addLog = async (logData) => {
  try {
    // Add to Firestore
    const docRef = await addDoc(collection(db, 'logs'), {
      ...logData,
      userId: user.id,
      createdAt: new Date().toISOString()
    });
    
    // Create complete log object with ID
    const newLog = {
      id: docRef.id,  // Explicitly set the ID field
      ...logData,
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    
    console.log('Added new log with ID:', newLog.id);
    
    // Update state with the new log that includes the ID
    //setCurrentLog(newLog);
    setLogs(prevLogs => [newLog, ...prevLogs]);

    return newLog;
  } catch (error) {
    console.error('Error adding log:', error);
    throw error;
  }
};

// Update a log in Firestore
const updateLog = async (amount, description, categoryName, date) => {
  try {
    if (!user || !currentLog) {
      console.error("No user or current log selected");
      return;
    }
    
      // Remove commas and other non-numeric characters except decimal point
    const cleanAmount = amount.toString().replace(/[^\d.-]/g, '');
    
    amount = toFixedNumber(cleanAmount, 2);

    console.log('AuthContext.jsx updatelog')
    console.log(amount)
    
    // Create transaction object
    let newTransaction = {
      id: Date.now().toString(),
      amount,
      description,
      category: categoryName,
      date: date.toISOString().split('T')[0]
    };
    
    console.log('currentLog:')
    console.log(JSON.stringify(currentLog))

    // Create updated log object
    const updatedLog = { ...currentLog };
    
    // Add transaction
    updatedLog.transactions = [...(updatedLog.transactions || []), newTransaction];
    
    // Update amount
    const currentAmount = typeof updatedLog.totalAmount === 'number' ? updatedLog.totalAmount : 0;
    updatedLog.totalAmount = parseFloat((currentAmount + amount).toFixed(2));
    

    console.log('currentAmount: ' + currentAmount);
    console.log('updatedLog.totalAmount: ' + updatedLog.totalAmount);

    // Update categories
    if (updatedLog.categories && updatedLog.categories.length > 0) {
      updatedLog.categories = updatedLog.categories.map(category => {
        if (category.name === categoryName) {
          const categoryAmount = typeof category.amount === 'number' ? category.amount : 0;
          return {
            ...category,
            amount: parseFloat((categoryAmount + amount).toFixed(2)),
            transactionCount: (category.transactionCount || 0) + 1,
          };
        }
        return category;
      });
      
      // Recalculate percentages
      const totalLogAmount = updatedLog.totalAmount;
      if (totalLogAmount > 0) {
        updatedLog.categories = updatedLog.categories.map(category => ({
          ...category,
          percentage: Math.round(((category.amount || 0) / totalLogAmount) * 100)
        }));
      }
    }

    // console.log('before calling firestore')
    // console.log('updatedLog.Id: ' + updatedLog.id);
    // console.log('currentLog.id: ' + currentLog.id);

    // Update in Firestore
    const logRef = doc(db, 'logs', updatedLog.id);

    // console.log('logref: ')
    // console.log(logRef)

    await updateDoc(logRef, {
      totalAmount: updatedLog.totalAmount,
      categories: updatedLog.categories,
      transactions: updatedLog.transactions,
      updatedAt: new Date().toISOString()
    });
    
    // console.log('after calling firestore')

    // Update local state
    const updatedLogs = logs.map(log => 
      log.id === updatedLog.id ? updatedLog : log
    );
    
    setLogs(updatedLogs);
    setCurrentLog(updatedLog);
    
  } catch (error) {
    console.error('Error updating log:', error);
  }
};

// Delete a log from Firestore
const deleteLog = async (logId) => {
  try {
    if (!user) {
      throw new Error('No authenticated user');
    }
    
    //console.log('Calling deleteLog with logId: ' + logId)

    // Delete from Firestore
    await deleteDoc(doc(db, 'logs', logId));
    
    //console.log('After deleteLog')

    // Update local state
    setLogs(logs.filter(log => log.id !== logId));
    
    // If deleted log is current log, clear currentLog
    if (currentLog && currentLog.id === logId) {

      //console.log("deleted log is current log")

      const remainingLogs = logs.filter(log => log.id !== logId);
      setCurrentLog(remainingLogs.length > 0 ? remainingLogs[0] : null);
    }
    
  } catch (error) {
    console.error('Error deleting log:', error);
    throw error;
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
      deleteLog,
      fetchUserLogs
    }}>
      {children}
    </AuthContext.Provider>
  );
}