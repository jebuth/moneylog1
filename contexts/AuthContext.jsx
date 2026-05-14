import React, { createContext, useState, useContext, useEffect } from 'react';
import { router } from 'expo-router';
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
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
import * as AppleAuthentication from 'expo-apple-authentication';
import { OAuthProvider } from 'firebase/auth';
// Import configurations
import { firebaseConfig, googleAuthConfig } from '../config/firebase';

// Initialize Firebase app

// console.log(firebaseConfig)
// console.log(googleAuthConfig)setcurr
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Recursively removes undefined values from objects/arrays before writing to Firestore
const stripUndefined = (value) => {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    );
  }
  return value;
};

// Default app-wide categories (stored once in appCategories collection, shared by all users)
const APP_CATEGORIES = [
  { name: 'Entertainment',  icon: 'game-controller-outline', color: '#6BCB77', order: 1 },
  { name: 'Gifts',          icon: 'gift-outline',            color: '#FF6BD6', order: 2 },
  { name: 'Groceries',      icon: 'cart-outline',            color: '#4D96FF', order: 3 },
  { name: 'Health/Medical', icon: 'medkit-outline',          color: '#4ECDC4', order: 4 },
  { name: 'Home',           icon: 'home-outline',            color: '#45B7D1', order: 5 },
  { name: 'Personal',       icon: 'person-outline',          color: '#A78BFA', order: 6 },
  { name: 'Pets',           icon: 'paw-outline',             color: '#FFA07A', order: 7 },
  { name: 'Restaurants',    icon: 'restaurant-outline',      color: '#FF6B6B', order: 8 },
  { name: 'Transportation', icon: 'car-outline',             color: '#96CEB4', order: 9 },
  { name: 'Utilities',      icon: 'flash-outline',           color: '#FFD93D', order: 10 },
];

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
  const [appCategories, setAppCategories] = useState([]);
  const [userCategories, setUserCategories] = useState([]); // merged: app + custom
  const [hiddenAppCategoryIds, setHiddenAppCategoryIds] = useState([]);

  // Google Auth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: googleAuthConfig.iosClientId,
    androidClientId: googleAuthConfig.androidClientId,
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
        
          // Fetch app categories, then user custom categories, then logs
          const hiddenIds = await fetchHiddenAppCategoryIds(firebaseUser.uid);
          setHiddenAppCategoryIds(hiddenIds);
          const fetchedAppCats  = await fetchAppCategories(hiddenIds);
          const fetchedUserCats = await fetchUserCategories(firebaseUser.uid);
          setUserCategories([...fetchedAppCats, ...fetchedUserCats]);
          await fetchUserLogs(firebaseUser.uid, fetchedUserCats, fetchedAppCats);

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
  const fetchUserLogs = async (userId, existingUserCats = [], appCats = []) => {
    try {
      setIsLoading(true);
      const logsRef = collection(db, 'logs');
      const q = query(logsRef, where('userId', '==', userId), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const userLogs = [];
      querySnapshot.forEach((d) => {
        const logData = d.data();
        userLogs.push({
          id: d.id,
          logTitle: logData.logTitle,
          totalAmount: logData.totalAmount,
          date: logData.date,
          categories: logData.categories || [],
          transactions: logData.transactions || [],
        });
      });

      if (userLogs.length === 0) {
        setLogs([]);
        setCurrentLog(null);
      } else {
        setLogs(userLogs);
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

  // Apple Sign In
  const signInWithApple = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const provider = new OAuthProvider('apple.com');
      const oauthCredential = provider.credential({
        idToken: credential.identityToken,
      });

      const userCredential = await signInWithCredential(auth, oauthCredential);
      router.replace('/(main)/screen1');
      return { success: true };
    } catch (error) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User cancelled — not an error
        return { success: false, cancelled: true };
      }
      console.error('Apple sign-in error:', error);
      setError(error.message || 'Failed to sign in with Apple');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
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


  // Delete a transaction from the current log
  const deleteTransaction = async (transactionId) => {
    try {
      if (!user || !currentLog) return;

      const tx = currentLog.transactions.find(t => t.id === transactionId);
      if (!tx) return;

      const updatedLog = { ...currentLog };
      updatedLog.transactions = updatedLog.transactions.filter(t => t.id !== transactionId);
      updatedLog.totalAmount = parseFloat((updatedLog.totalAmount - tx.amount).toFixed(2));

      updatedLog.categories = updatedLog.categories.map(cat => {
        if (cat.categoryId !== tx.categoryId) return cat;
        return {
          ...cat,
          amount: Math.max(0, parseFloat((cat.amount - tx.amount).toFixed(2))),
          transactionCount: Math.max(0, (cat.transactionCount || 1) - 1),
        };
      });

      if (updatedLog.totalAmount > 0) {
        updatedLog.categories = updatedLog.categories.map(cat => ({
          ...cat,
          percentage: Math.round((cat.amount / updatedLog.totalAmount) * 100),
        }));
      } else {
        updatedLog.categories = updatedLog.categories.map(cat => ({ ...cat, percentage: 0 }));
      }

      const logRef = doc(db, 'logs', updatedLog.id);
      await updateDoc(logRef, {
        totalAmount: updatedLog.totalAmount,
        categories: updatedLog.categories,
        transactions: updatedLog.transactions,
        updatedAt: new Date().toISOString(),
      });

      setLogs(logs.map(l => l.id === updatedLog.id ? updatedLog : l));
      setCurrentLog(updatedLog);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Delete a category and its transactions from the current log
  const deleteCategory = async (categoryId) => {
    try {
      if (!user || !currentLog) return;
      const cat = currentLog.categories.find(c => c.categoryId === categoryId);
      if (!cat) return;
      const updatedLog = { ...currentLog };
      updatedLog.categories = updatedLog.categories.filter(c => c.categoryId !== categoryId);
      updatedLog.transactions = updatedLog.transactions.filter(tx => tx.categoryId !== categoryId);
      updatedLog.totalAmount = parseFloat((updatedLog.totalAmount - cat.amount).toFixed(2));
      if (updatedLog.totalAmount > 0) {
        updatedLog.categories = updatedLog.categories.map(c => ({
          ...c, percentage: Math.round((c.amount / updatedLog.totalAmount) * 100),
        }));
      } else {
        updatedLog.categories = updatedLog.categories.map(c => ({ ...c, percentage: 0 }));
      }
      const logRef = doc(db, 'logs', updatedLog.id);
      await updateDoc(logRef, {
        categories: updatedLog.categories,
        transactions: updatedLog.transactions,
        totalAmount: updatedLog.totalAmount,
        updatedAt: new Date().toISOString(),
      });
      setLogs(logs.map(l => l.id === updatedLog.id ? updatedLog : l));
      setCurrentLog(updatedLog);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  // Add new categories to the current log
  const addCategoriesToLog = async (newCategories) => {
    try {
      if (!user || !currentLog) return;
      const existingIds = new Set(currentLog.categories.map(c => c.categoryId));
      const toAdd = newCategories.filter(c => !existingIds.has(c.categoryId));
      if (toAdd.length === 0) return;
      const updatedLog = { ...currentLog, categories: [...currentLog.categories, ...toAdd] };
      const logRef = doc(db, 'logs', updatedLog.id);
      await updateDoc(logRef, { categories: updatedLog.categories, updatedAt: new Date().toISOString() });
      setLogs(logs.map(l => l.id === updatedLog.id ? updatedLog : l));
      setCurrentLog(updatedLog);
    } catch (error) {
      console.error('Error adding categories:', error);
    }
  };

  // Fetch user's custom categories only (state is set by caller after merging with app cats)
  const fetchUserCategories = async (userId) => {
    try {
      const catRef = collection(db, 'users', userId, 'categories');
      const snapshot = await getDocs(catRef);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data(), source: 'user' }));
    } catch (error) {
      console.error('Error fetching user categories:', error);
      return [];
    }
  };

  // Fetch hidden app category IDs from the user document
  const fetchHiddenAppCategoryIds = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().hiddenAppCategoryIds || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching hidden app category IDs:', error);
      return [];
    }
  };

  // Fetch app-wide categories (seeds the collection if it doesn't exist yet)
  const fetchAppCategories = async (hiddenIds = []) => {
    try {
      const ref = collection(db, 'appCategories');
      const snapshot = await getDocs(ref);
      let allCats;
      if (snapshot.empty) {
        allCats = await seedAppCategories();
      } else {
        allCats = snapshot.docs
          .map(d => ({ id: d.id, ...d.data(), source: 'app' }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      setAppCategories(allCats);
      return allCats.filter(c => !hiddenIds.includes(c.id));
    } catch (error) {
      console.error('Error fetching app categories:', error);
      return [];
    }
  };

  // Seed appCategories collection (runs once ever, when collection is empty)
  const seedAppCategories = async () => {
    try {
      const ref = collection(db, 'appCategories');
      const created = [];
      for (const cat of APP_CATEGORIES) {
        const docRef = await addDoc(ref, cat);
        created.push({ id: docRef.id, ...cat, source: 'app' });
      }
      console.log('App categories seeded');
      return created;
    } catch (error) {
      console.error('Error seeding app categories:', error);
      return [];
    }
  };


  // Create a new custom category for the user
  const createUserCategory = async (name) => {
    try {
      if (!user) return null;
      const PALETTE = ['#FF6B6B','#FF8E53','#FF6BD6','#4ECDC4','#45B7D1','#96CEB4','#A78BFA','#FFA07A','#FFD93D','#6BCB77','#4D96FF'];
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const catRef = collection(db, 'users', user.id, 'categories');
      const docRef = await addDoc(catRef, {
        name, icon: 'grid-outline', color, isDeleted: false, createdAt: new Date().toISOString(),
      });
      const newCat = { id: docRef.id, name, icon: 'grid-outline', color, isDeleted: false, source: 'user' };
      setUserCategories(prev => [...prev, newCat]);
      return newCat;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  };

  // Soft-delete a category (app or custom). Keeps historical log/transaction data intact.
  const softDeleteCategory = async (categoryId, source) => {
    try {
      if (!user) return;
      if (source === 'app') {
        const newHidden = [...hiddenAppCategoryIds, categoryId];
        setHiddenAppCategoryIds(newHidden);
        setUserCategories(prev => prev.filter(c => c.id !== categoryId));
        await updateDoc(doc(db, 'users', user.id), { hiddenAppCategoryIds: newHidden });
      } else {
        setUserCategories(prev => prev.map(c => c.id === categoryId ? { ...c, isDeleted: true } : c));
        await updateDoc(doc(db, 'users', user.id, 'categories', categoryId), {
          isDeleted: true, deletedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error soft-deleting category:', error);
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
const updateLog = async (amount, description, categoryName, date, categoryId = null) => {
  try {
    if (!user || !currentLog) {
      console.error("No user or current log selected");
      return;
    }
    
      // Remove commas and other non-numeric characters except decimal point
    const cleanAmount = amount.toString().replace(/[^\d.-]/g, '');
    
    amount = toFixedNumber(cleanAmount, 2);

    
    // Create transaction object
    let newTransaction = {
      id: Date.now().toString(),
      amount,
      description,
      category: categoryName,
      categoryId,
      date: date.toISOString().split('T')[0]
    };
    


    // Create updated log object
    const updatedLog = { ...currentLog };
    
    // Add transaction
    updatedLog.transactions = [...(updatedLog.transactions || []), newTransaction];
    
    // Update amount
    const currentAmount = typeof updatedLog.totalAmount === 'number' ? updatedLog.totalAmount : 0;
    updatedLog.totalAmount = parseFloat((currentAmount + amount).toFixed(2));
    



    // Update categories
    if (updatedLog.categories && updatedLog.categories.length > 0) {
      updatedLog.categories = updatedLog.categories.map(category => {
        if (category.categoryId === categoryId) {
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
      signInWithApple,
      isAuthenticated: !!user,
      deleteTransaction,
      addCategoriesToLog,
      deleteCategory,

      // categories
      appCategories,
      userCategories,
      hiddenAppCategoryIds,
      createUserCategory,
      softDeleteCategory,

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