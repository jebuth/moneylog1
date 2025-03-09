import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
//import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

// Import theme context (create this context to manage theme)
// import { useThemeContext } from '../../contexts/ThemeContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const {theme, isDarkMode, toggleTheme} = useTheme();
  
  // Replace with useThemeContext hook when implemented
  //const [isDarkMode, setIsDarkMode] = useState(true);
  const [isPro, setIsPro] = useState(false); // This would come from user data in a real app
  
  // Toggle theme
  // const toggleTheme = () => {
  //   setIsDarkMode(previous => !previous);
  //   // When using ThemeContext:
  //   // themeContext.toggleTheme();
  // };
  
  // Handle subscription
  const handleSubscribe = () => {
    Alert.alert(
      "Subscribe to Pro",
      "Would you like to upgrade to the Pro version for $4.99/month?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Subscribe",
          onPress: () => {
            // In a real app, this would integrate with in-app purchases
            Alert.alert("Success", "Thank you for subscribing to Pro!");
            setIsPro(true);
          }
        }
      ]
    );
  };
  
  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          onPress: () => logout(),
          style: "destructive"
        }
      ]
    );
  };
  
  // Open privacy policy
  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.example.com/privacy-policy');
  };
  
  // Open terms of service
  const openTermsOfService = () => {
    Linking.openURL('https://www.example.com/terms-of-service');
  };
  
  // Get app version
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  
  return (
    // <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* <StatusBar style={isDarkMode ? "light" : "dark"} /> */}
      {/* <StatusBar barStyle={ isDarkMode ? "light-content" : "dark-content"} /> */}
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Account</Text>
          
          <View style={styles.accountInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.email ? user.email[0].toUpperCase() : 'U'}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'User'}</Text>
              <Text style={[styles.userEmail, { color: theme.subtext }]}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>
          
          {!isPro && (
            <TouchableOpacity 
              style={styles.proButton}
              onPress={handleSubscribe}
            >
              <View style={styles.proButtonContent}>
                <Ionicons name="star" size={20} color="#FFFFFF" />
                <Text style={styles.proButtonText}>Upgrade to Pro</Text>
              </View>
            </TouchableOpacity>
          )}
          
          {isPro && (
            <View style={styles.proStatus}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={[styles.proStatusText, { color: theme.text }]}>Pro Subscription Active</Text>
            </View>
          )}
        </View>
        
        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="moon-outline" size={22} color={theme.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#5C5CFF' }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>
        
        {/* Legal Section */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Legal</Text>
          
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: theme.divider }]}
            onPress={openPrivacyPolicy}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons name="lock-closed-outline" size={22} color={theme.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={openTermsOfService}
          >
            <View style={styles.settingLabelContainer}>
              <Ionicons name="document-text-outline" size={22} color={theme.text} style={styles.settingIcon} />
              <Text style={[styles.settingLabel, { color: theme.text }]}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
          </TouchableOpacity>
        </View>
        
        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.red }]}
          onPress={handleSignOut}
        >
          <Text style={[styles.signOutText, { color: theme.red }]}>SIGN OUT</Text>
        </TouchableOpacity>
        
        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.subtext }]}>
          Version {appVersion}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5C5CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  proButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#5C5CFF',
    borderRadius: 8,
    padding: 12,
  },
  proButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  proStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  proStatusText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 32,
  },
});