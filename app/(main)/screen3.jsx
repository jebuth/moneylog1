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
  StatusBar
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isPro, setIsPro] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleSubscribe = () => {
    Alert.alert('Subscribe to Pro', 'Would you like to upgrade to the Pro version for $4.99/month?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Subscribe', onPress: () => { Alert.alert('Success', 'Thank you for subscribing to Pro!'); setIsPro(true); } },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', onPress: () => logout(), style: 'destructive' },
    ]);
  };

  const openPrivacyPolicy  = () => Linking.openURL('https://www.example.com/privacy-policy');
  const openTermsOfService = () => Linking.openURL('https://www.example.com/terms-of-service');

  const avatarLetter = user?.email ? user.email[0].toUpperCase() : 'U';

  const t = isDarkMode ? {
    bg:           '#0f0f0f',
    name:         '#fff',
    email:        '#555',
    sectionLabel: '#333',
    rowBorder:    '#141414',
    rowLabel:     '#888',
    rowIcon:      '#666',
    chevron:      '#333',
    switchTrackOff: '#2a2a2a',
    switchBgIos:    '#2a2a2a',
    version:      '#2a2a2a',
    statusBar:    'light-content',
  } : {
    bg:           '#EEF2F7',
    name:         '#0A1628',
    email:        '#4A6FA5',
    sectionLabel: '#8BA3C0',
    rowBorder:    '#D8E2EE',
    rowLabel:     '#1A2A40',
    rowIcon:      '#4A6FA5',
    chevron:      '#A8BACE',
    switchTrackOff: '#D8E2EE',
    switchBgIos:    '#D8E2EE',
    version:      '#A8BACE',
    statusBar:    'dark-content',
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
      <StatusBar barStyle={t.statusBar} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Centered profile */}
        <View style={styles.profileBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{avatarLetter}</Text>
          </View>
          <Text style={[styles.name, { color: t.name }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.email, { color: t.email }]}>{user?.email || 'user@example.com'}</Text>
          {isPro
            ? <View style={styles.proBadge}><Ionicons name="star" size={12} color="#FFD700" /><Text style={styles.proBadgeTxt}>PRO</Text></View>
            : <TouchableOpacity style={styles.proBtn} onPress={handleSubscribe}><Text style={styles.proBtnTxt}>Upgrade to Pro</Text></TouchableOpacity>
          }
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: t.sectionLabel }]}>PREFERENCES</Text>
          <View style={[styles.row, styles.rowTop, { borderTopColor: t.rowBorder }]}>
            <Ionicons name="moon-outline" size={20} color={t.rowIcon} style={{ marginRight: 14 }} />
            <Text style={[styles.rowLabel, { flex: 1, color: t.rowLabel }]}>Dark Mode</Text>
            <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: t.switchTrackOff, true: '#5C5CFF' }} thumbColor="#fff" ios_backgroundColor={t.switchBgIos} />
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: t.sectionLabel }]}>LEGAL</Text>
          <TouchableOpacity style={[styles.row, styles.rowTop, styles.rowDivider, { borderTopColor: t.rowBorder, borderBottomColor: t.rowBorder }]} onPress={openPrivacyPolicy}>
            <Ionicons name="lock-closed-outline" size={20} color={t.rowIcon} style={{ marginRight: 14 }} />
            <Text style={[styles.rowLabel, { flex: 1, color: t.rowLabel }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={t.chevron} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={openTermsOfService}>
            <Ionicons name="document-text-outline" size={20} color={t.rowIcon} style={{ marginRight: 14 }} />
            <Text style={[styles.rowLabel, { flex: 1, color: t.rowLabel }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={t.chevron} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color="#ff4444" style={{ marginRight: 8 }} />
            <Text style={styles.signOutTxt}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={[styles.version, { color: t.version }]}>Version {appVersion}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1 },
  scroll:       { flexGrow: 1, paddingBottom: 24 },
  bottom:       { flex: 1, justifyContent: 'flex-end', paddingBottom: 8 },
  profileBlock: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20 },
  avatar:       { width: 72, height: 72, borderRadius: 36, backgroundColor: '#5C5CFF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTxt:    { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  name:         { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  email:        { fontSize: 14, marginBottom: 14 },
  proBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,215,0,0.1)', borderWidth: 1, borderColor: '#FFD700', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  proBadgeTxt:  { color: '#FFD700', fontSize: 12, fontWeight: '700' },
  proBtn:       { backgroundColor: '#5C5CFF', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  proBtnTxt:    { color: '#fff', fontWeight: '600', fontSize: 14 },
  section:      { marginHorizontal: 20, marginBottom: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  row:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowTop:       { borderTopWidth: 1 },
  rowDivider:   { borderBottomWidth: 1 },
  rowLabel:     { fontSize: 15 },
  signOut:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, paddingVertical: 14 },
  signOutTxt:   { color: '#ff4444', fontSize: 15, fontWeight: '500' },
  version:      { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
