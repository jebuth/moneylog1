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
// console.log(googleAuthConfig)
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
      { id: '1', tripName: 'Mexico Trip 2024', totalAmount: 23624.69, date: '2024-03-01' },
      { id: '2', tripName: 'Japan Vacation', totalAmount: 15420.50, date: '2023-11-15' },
      { id: '3', tripName: 'Business Trip NYC', totalAmount: 4850.75, date: '2023-09-22' },
      { id: '4', tripName: 'Europe Tour', totalAmount: 32150.00, date: '2023-07-10' },
      { id: '5', tripName: 'Weekend Getaway', totalAmount: 1250.30, date: '2023-05-05' },
    ]);
    
    // Add a log
    const addLog = (log) => {
      setLogs([log, ...logs]);
    };
    
    // Update a log
    const updateLog = (updatedLog) => {
      const updatedLogs = logs.map(log => 
        log.id === updatedLog.id ? updatedLog : log
      );
      setLogs(updatedLogs);
      
      // Also update currentLog if it's the one being updated
      if (currentLog && currentLog.id === updatedLog.id) {
        setCurrentLog(updatedLog);
      }
    };
    
    // Delete a log
    const deleteLog = (logId) => {
      setLogs(logs.filter(log => log.id !== logId));
      
      // If deleted log is current log, clear currentLog
      if (currentLog && currentLog.id === logId) {
        setCurrentLog(null);
      }
    };


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