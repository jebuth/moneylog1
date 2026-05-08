import React, { useState, useRef, useCallback } from 'react';
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
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LogsListScreen() {
  const { isLoading, user, logs, setLogs, currentLog, setCurrentLog, addLog, deleteLog } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();

  const [openSwipeableId, setOpenSwipeableId]   = useState(null);
  const swipeableRefs                           = useRef({});
  const itemHeights                             = useRef({});
  const slideOutAnim                            = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery]           = useState('');
  const [showNewLogModal, setShowNewLogModal]   = useState(false);
  const [newLogName, setNewLogName]             = useState('');
  const [itemBeingDeleted, setItemBeingDeleted] = useState(null);

  const configureLayoutAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create:  { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
      update:  { type: LayoutAnimation.Types.easeInEaseOut },
      delete:  { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
    });
  };

  const filteredLogs = logs.filter(log =>
    log && log.logTitle && log.logTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeOpenSwipeable = useCallback(() => {
    if (openSwipeableId && swipeableRefs.current[openSwipeableId]) {
      swipeableRefs.current[openSwipeableId].close();
      setOpenSwipeableId(null);
    }
  }, [openSwipeableId]);

  const navigateToExpenseScreen = useCallback((log) => {
    closeOpenSwipeable();
    if (!log) {
      Alert.alert('No Log Selected', 'Please create a trip first before adding expenses.', [{ text: 'OK' }]);
      return;
    }
    setCurrentLog(log);
    navigation.navigate('screen1');
  }, [closeOpenSwipeable, navigation, setCurrentLog]);

  const handleCreateNewLog = async () => {
    if (newLogName.trim() === '') { alert('Enter a log title.'); return; }
    const logData = {
      userId: user.id,
      logTitle: newLogName,
      totalAmount: 0,
      date: new Date().toISOString().split('T')[0],
      categories: [
        { id: 1,  name: 'Restaurants',    amount: 0, percentage: 0, transactionCount: 0 },
        { id: 2,  name: 'Gifts',          amount: 0, percentage: 0, transactionCount: 0 },
        { id: 3,  name: 'Health/Medical', amount: 0, percentage: 0, transactionCount: 0 },
        { id: 4,  name: 'Home',           amount: 0, percentage: 0, transactionCount: 0 },
        { id: 5,  name: 'Transportation', amount: 0, percentage: 0, transactionCount: 0 },
        { id: 6,  name: 'Personal',       amount: 0, percentage: 0, transactionCount: 0 },
        { id: 7,  name: 'Pets',           amount: 0, percentage: 0, transactionCount: 0 },
        { id: 8,  name: 'Utilities',      amount: 0, percentage: 0, transactionCount: 0 },
        { id: 9,  name: 'Entertainment',  amount: 0, percentage: 0, transactionCount: 0 },
        { id: 10, name: 'Groceries',      amount: 0, percentage: 0, transactionCount: 0 },
      ],
      transactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    let addedLog = await addLog(logData);
    configureLayoutAnimation();
    setLogs([addedLog, ...logs]);
    setSearchQuery('');
    setShowNewLogModal(false);
    setNewLogName('');
  };

  const handleDeleteLog = async (logId) => {
    Alert.alert('Delete Log', 'Are you sure you want to delete this log? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setItemBeingDeleted(logId);
          await deleteLog(logId);
          slideOutAnim.setValue(0);
          Animated.timing(slideOutAnim, { toValue: -width, duration: 400, useNativeDriver: true }).start(() => {
            setLogs(logs.filter(log => log.id !== logId));
            setOpenSwipeableId(null);
            setItemBeingDeleted(null);
          });
        },
      },
    ]);
  };

  const formatCurrency = (amount) =>
    amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const closeModal = () => { setShowNewLogModal(false); setNewLogName(''); };

  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({ inputRange: [-100, 0], outputRange: [0, 100], extrapolate: 'clamp' });
    return (
      <Animated.View style={[styles.deleteWrap, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteLog(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#FFF" />
          <Text style={styles.deleteTxt}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderItem = useCallback(({ item }) => {
    const isSelected = currentLog?.id === item.id;
    const totalTx = Array.isArray(item.categories)
      ? item.categories.reduce((s, c) => s + (c.transactionCount || 0), 0)
      : 0;
    const isBeingDeleted = item.id === itemBeingDeleted;

    return (
      <Animated.View style={isBeingDeleted ? { transform: [{ translateX: slideOutAnim }] } : {}}>
        <Swipeable
          ref={ref => { if (ref) swipeableRefs.current[item.id] = ref; }}
          renderRightActions={(p, d) => renderRightActions(p, d, item)}
          onSwipeableOpen={() => {
            if (openSwipeableId && openSwipeableId !== item.id) swipeableRefs.current[openSwipeableId]?.close();
            setOpenSwipeableId(item.id);
          }}
          onSwipeableClose={() => { if (openSwipeableId === item.id) setOpenSwipeableId(null); }}
          friction={2}
          rightThreshold={40}
        >
          <TouchableOpacity
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => navigateToExpenseScreen(item)}
            activeOpacity={0.85}
          >
            <View style={styles.left}>
              <Text style={styles.title} numberOfLines={1}>{item.logTitle}</Text>
              <Text style={styles.meta}>{item.date}  ·  {totalTx} transactions</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.amount}>{formatCurrency(item.totalAmount)}</Text>
              <Ionicons name="chevron-forward" size={18} color="#444" />
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  }, [openSwipeableId, itemBeingDeleted, slideOutAnim, navigateToExpenseScreen, currentLog]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#5C5CFF" />
          <Text style={{ color: '#aaa', marginTop: 20 }}>Loading log data...</Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <StatusBar style="light" />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Logs</Text>
            <TouchableOpacity style={styles.addLogBtn} onPress={() => { closeOpenSwipeable(); setShowNewLogModal(true); }}>
              <Ionicons name="add" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#555"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#555" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={filteredLogs}
            extraData={[logs, currentLog]}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            onScroll={closeOpenSwipeable}
            removeClippedSubviews={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', marginTop: 60, padding: 32 }}>
                <Ionicons name="document-text-outline" size={48} color="#333" style={{ marginBottom: 16 }} />
                <Text style={{ color: '#666', fontSize: 16, textAlign: 'center', marginBottom: 24 }}>
                  {searchQuery.length > 0 ? 'No logs match your search' : "You haven't added any logs yet..."}
                </Text>
                {searchQuery.length === 0 && (
                  <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowNewLogModal(true)}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Add Your First Log</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </SafeAreaView>

        <Modal visible={showNewLogModal} animationType="fade" transparent onRequestClose={closeModal}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={MB.overlay}>
            <View style={MB.card}>
              <View style={MB.iconWrap}>
                <Ionicons name="document-text-outline" size={32} color="#5C5CFF" />
              </View>
              <TextInput
                style={MB.input}
                placeholder="What are you tracking?"
                placeholderTextColor="#555"
                value={newLogName}
                onChangeText={setNewLogName}
                autoFocus
              />
              <TouchableOpacity style={MB.addBtn} onPress={handleCreateNewLog}>
                <Text style={MB.addTxt}>Create Log</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={closeModal}>
                <Text style={MB.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#0f0f0f' },
  safe:         { flex: 1, paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  headerTitle:  { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  addLogBtn:    { width: 44, height: 44, borderRadius: 22, backgroundColor: '#5C5CFF', alignItems: 'center', justifyContent: 'center' },
  searchBar:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 12, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 14, height: 46, borderWidth: 1, borderColor: '#222' },
  searchInput:  { flex: 1, color: '#fff', fontSize: 15 },
  list:         { paddingHorizontal: 16, paddingBottom: 120 },
  card:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#141414', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#222', borderLeftWidth: 4, borderLeftColor: '#222' },
  cardSelected: { borderLeftColor: '#5C5CFF' },
  left:         { flex: 1, marginRight: 12 },
  title:        { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  meta:         { fontSize: 12, color: '#555' },
  right:        { alignItems: 'flex-end', gap: 6 },
  amount:       { fontSize: 15, fontWeight: '700', color: '#fff' },
  deleteWrap:   { width: 90, marginBottom: 8 },
  deleteBtn:    { flex: 1, backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  deleteTxt:    { color: '#fff', fontWeight: 'bold', fontSize: 12, marginTop: 4 },
  emptyBtn:     { backgroundColor: '#5C5CFF', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
});

// ── Modal toggle pill ─────────────────────────────────────────────────────────
const mToggle = StyleSheet.create({
  btn:    { backgroundColor: 'rgba(92,92,255,0.85)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center' },
  small:  { color: '#ccc', fontSize: 9, fontWeight: '600', letterSpacing: 1 },
  letter: { color: '#fff', fontSize: 16, fontWeight: 'bold', lineHeight: 18 },
});

// ── Modal A — Bottom sheet ────────────────────────────────────────────────────
const MA = StyleSheet.create({
  wrap:      { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:     { backgroundColor: '#141414', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderWidth: 1, borderColor: '#222' },
  row:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  handle:    { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2 },
  title:     { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  label:     { fontSize: 11, fontWeight: '700', color: '#555', letterSpacing: 1, marginBottom: 6 },
  input:     { backgroundColor: '#1e1e1e', borderRadius: 10, padding: 14, fontSize: 15, color: '#fff', marginBottom: 24, borderWidth: 1, borderColor: '#2a2a2a' },
  btns:      { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 10, borderWidth: 1, borderColor: '#ff4444', alignItems: 'center', justifyContent: 'center' },
  cancelTxt: { color: '#ff4444', fontWeight: '700' },
  addBtn:    { flex: 1, height: 48, borderRadius: 10, backgroundColor: '#5C5CFF', alignItems: 'center', justifyContent: 'center' },
  addTxt:    { color: '#fff', fontWeight: '700', fontSize: 15 },
});

// ── Modal B — Centered dialog ─────────────────────────────────────────────────
const MB = StyleSheet.create({
  overlay:   { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.75)', padding: 24 },
  card:      { width: '100%', backgroundColor: '#141414', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#222', alignItems: 'center' },
  iconWrap:  { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1e1e1e', alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 8 },
  title:     { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  input:     { width: '100%', backgroundColor: '#1e1e1e', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff', marginBottom: 20, borderWidth: 1, borderColor: '#2a2a2a', textAlign: 'center' },
  addBtn:    { width: '100%', height: 50, borderRadius: 14, backgroundColor: '#5C5CFF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  addTxt:    { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelTxt: { color: '#555', fontSize: 14, paddingVertical: 4 },
});

// ── Modal C — Immersive input ─────────────────────────────────────────────────
const MC = StyleSheet.create({
  wrap:   { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:  { backgroundColor: '#0f0f0f', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 48 : 24, borderTopWidth: 1, borderColor: '#222' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  addBtn: { backgroundColor: '#5C5CFF', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  addTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  hint:   { fontSize: 13, color: '#555', fontWeight: '600', letterSpacing: 1, marginBottom: 12 },
  input:  { fontSize: 28, fontWeight: 'bold', color: '#fff', borderBottomWidth: 1, borderBottomColor: '#2a2a2a', paddingBottom: 12, marginBottom: 8 },
});
