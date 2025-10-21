import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors
export const lightTheme = {
  background: '#F5F5F5',
  backgroundShadow1: '#DDDDDD',
  backgroundShadow2: '#CECECE',
  card: '#FFFFFF',
  text: '#000000',
  subtext: '#666666',
  divider: '#EEEEEE',
  accent: '#5C5CFF',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF3B30',
  input: '#FFFFFF',
  inputBorder: '#CCCCCC',
  red: '#FF3B30',
  iconColor: '#68a8d4',
  iconColorSecondary: '#000',
  backgroundGradient: ['#C5CBEB', '#DCE0F4', '#F0F2FA'],
  cardGradient: [
    'rgba(255, 255, 255, .7)',
    'rgba(255, 255, 255, .5)',
    'rgba(255, 255, 255, .3)'
  ],
  purple: '#5749C5'
};

export const darkTheme = {
  background: '#121212',
  backgroundShadow1: '#DCDCDC',
  backgroundShadow2: '#C7C7C7',
  card: '#1D1D1D',
  text: '#FFFFFF',
  subtext: '#AAAAAA',
  divider: '#333333',
  accent: '#5C5CFF',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF3B30',
  input: '#2A2A2A',
  inputBorder: '#444444',
  red: '#FF3B30',
  iconColor: '#68a8d4',
  iconColorSecondary: '#FFF',
  backgroundGradient:['#12141A', '#1E2028', '#2A2C38'],
  cardGradient: [
    'rgba(32, 36, 45, 0.7)', 
    'rgba(25, 28, 35, 0.5)',    
    'rgba(18, 20, 26, 0.3)',    // Just a touch of blue
  ],
  purple: '#5749C5'
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  
  // Current theme object based on mode
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Load theme preference from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme !== null) {
          setIsDarkMode(storedTheme === 'dark');
        }
        setIsThemeLoaded(true);
      } catch (error) {
        console.error('Error loading theme preference:', error);
        setIsThemeLoaded(true);
      }
    };
    
    loadTheme();
  }, []);
  
  // Toggle theme and save preference
  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    try {
      await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme,
        toggleTheme,
        isThemeLoaded
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};