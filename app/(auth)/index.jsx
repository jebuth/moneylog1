import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Alert
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const { signInWithGoogle, signInWithApple, isLoading, error } = useAuth();
  const { theme, isDarkMode } = useTheme();
  
  // Animation for pulsing logo
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Start pulsing animation
  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]);
    
    // Loop the animation
    Animated.loop(pulse).start();
    
    return () => {
      // Clean up animation when component unmounts
      pulseAnim.stopAnimation();
    };
  }, []);
  
  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleAppleSignIn = async () => {
    Alert.alert(
      "Sign in with Apple",
      "This feature is coming soon.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };

  // Gradient colors based on theme
  const gradientColors = isDarkMode 
    ? ['#121212', '#1f1f1f', '#2a2a2a'] // Dark theme gradient
    : ['#f0f2f5', '#e2e7f0', '#d4dcea']; // Light theme gradient

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentContainer}>
          {/* Pulsing App Logo */}
          <Animated.View 
            style={[
              styles.logoContainer, 
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={[styles.logoCircle, { backgroundColor: theme.accent }]}>
              <Image 
                source={require('../../assets/images/moneylog-logo-nbg.png')} 
                style={styles.moneylogIcon}
              />
            </View>
          </Animated.View>
          
          {/* App Title */}
          <Text style={[styles.title, { color: theme.text }]}>Moneylog</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>Actually track your expenses</Text>
          
          {/* Sign in with Google button */}
          <TouchableOpacity
            style={[styles.signInButton, { 
              backgroundColor: theme.card,
              borderColor: theme.divider,
              marginTop: 60
            }]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading && isLoading === 'google' ? (
              <ActivityIndicator color={theme.accent} size="small" />
            ) : (
              <>
                <Image 
                  source={require('../../assets/images/google-logo.png')} 
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  Sign in with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Sign in with Apple button */}
          <TouchableOpacity
            style={[styles.signInButton, { 
              backgroundColor: isDarkMode ? '#000' : '#fff',
              borderColor: theme.divider,
              marginTop: 16
            }]}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            {isLoading && isLoading === 'apple' ? (
              <ActivityIndicator color={isDarkMode ? '#fff' : '#000'} size="small" />
            ) : (
              <>
                <Ionicons 
                  name="logo-apple" 
                  size={24} 
                  color={isDarkMode ? '#fff' : '#000'} 
                  style={styles.buttonIcon} 
                />
                <Text style={[styles.buttonText, { 
                  color: isDarkMode ? '#fff' : '#000',
                  fontWeight: '600'
                }]}>
                  Sign in with Apple
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Error message */}
          {error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}
          
          {/* App version */}
          <Text style={[styles.versionText, { color: theme.subtext }]}>Version 1.0.0</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#5C5CFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  signInButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  moneylogIcon: {
    width: 134,
    height: 134,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
  versionText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
  }
});