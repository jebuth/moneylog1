import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
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
import { CategoryIcons } from '../../constants/CategoryIcons';
import Constants from 'expo-constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DARK = {
  bg:           '#000000',
  headerBorder: '#0f1012',
  headerTitle:  '#e2e2e2',
  searchBg:     '#111314',
  searchBorder: '#1e2124',
  searchText:   '#e2e2e2',
  searchHolder: '#555',
  cardBg:       '#0e1012',
  cardBorder:   'rgba(255,255,255,0.07)',
  cardLeft:     '#1e2124',
  title:        '#e2e2e2',
  meta:         '#555',
  amount:       '#e2e2e2',
  chevron:      '#444',
  emptyIcon:    '#333',
  emptyText:    '#555',
  loaderText:   '#aaa',
  modalCardBg:  '#0e1012',
  modalBorder:  'rgba(255,255,255,0.07)',
  modalIconBg:  '#141618',
  modalInputBg: '#141618',
  modalInputBorder: '#1e2124',
  modalInputText:   '#e2e2e2',
  modalHolder:  '#555',
  modalCancel:  '#555',
};

const LIGHT = {
  bg:           '#EEF2F7',
  headerBorder: '#D8E2EE',
  headerTitle:  '#0A1628',
  searchBg:     '#FFFFFF',
  searchBorder: '#D8E2EE',
  searchText:   '#0A1628',
  searchHolder: '#A8BACE',
  cardBg:       '#FFFFFF',
  cardBorder:   '#D8E2EE',
  cardLeft:     '#D8E2EE',
  title:        '#0A1628',
  meta:         '#4A6FA5',
  amount:       '#0A1628',
  chevron:      '#A8BACE',
  emptyIcon:    '#A8BACE',
  emptyText:    '#4A6FA5',
  loaderText:   '#4A6FA5',
  modalCardBg:  '#FFFFFF',
  modalBorder:  '#D8E2EE',
  modalIconBg:  '#EEF2F7',
  modalInputBg: '#EEF2F7',
  modalInputBorder: '#D8E2EE',
  modalInputText:   '#0A1628',
  modalHolder:  '#A8BACE',
  modalCancel:  '#8BA3C0',
};

export default function LogsListScreen() {
  const { isLoading, user, logs, setLogs, currentLog, setCurrentLog, addLog, deleteLog, userCategories } = useAuth();
  const { isDarkMode } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const t = isDarkMode ? DARK : LIGHT;

  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 2, duration: 1200, useNativeDriver: true }),
        Animated.delay(1800),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const [openSwipeableId, setOpenSwipeableId]   = useState(null);
  const swipeableRefs                           = useRef({});
  const itemHeights                             = useRef({});
  const slideOutAnim                            = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery]           = useState('');
  const [showNewLogModal, setShowNewLogModal]   = useState(false);
  const [newLogName, setNewLogName]             = useState('');
  const [itemBeingDeleted, setItemBeingDeleted]     = useState(null);
  const [modalStep, setModalStep]                     = useState(1);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  useEffect(() => {
    if (route.params?.openNewLog) {
      setSelectedCategoryIds(userCategories.filter(c => !c.isDeleted).map(c => c.id));
      setShowNewLogModal(true);
      navigation.setParams({ openNewLog: undefined });
    }
  }, [route.params?.openNewLog]);

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

  const handleNextStep = () => {
    if (newLogName.trim() === '') { alert('Enter a log title.'); return; }
    setModalStep(2);
  };

  const toggleCategory = (id) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreateNewLog = async () => {
    if (selectedCategoryIds.length === 0) { alert('Select at least one category.'); return; }
    const selectedCats = userCategories
      .filter(c => selectedCategoryIds.includes(c.id) && !c.isDeleted)
      .map(c => ({ categoryId: c.id, name: c.name, icon: c.icon, color: c.color, amount: 0, percentage: 0, transactionCount: 0 }));
    const logData = {
      userId: user.id,
      logTitle: newLogName,
      totalAmount: 0,
      date: new Date().toISOString().split('T')[0],
      categories: selectedCats,
      transactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    let addedLog = await addLog(logData);
    configureLayoutAnimation();
    setLogs([addedLog, ...logs]);
    if (logs.length === 0) {
      setCurrentLog(addedLog);
      navigation.navigate('screen1');
    }
    setSearchQuery('');
    setShowNewLogModal(false);
    setNewLogName('');
    setModalStep(1);
    setSelectedCategoryIds([]);
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

  const closeModal = () => {
    setShowNewLogModal(false);
    setNewLogName('');
    setModalStep(1);
    setSelectedCategoryIds([]);
  };

  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({ inputRange: [-100, 0], outputRange: [0, 100], extrapolate: 'clamp' });
    return (
      <Animated.View style={[styles.deleteWrap, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteLog(item.id)}>
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
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
            style={[styles.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder, borderLeftColor: isSelected ? '#5C5CFF' : t.cardLeft }]}
            onPress={() => navigateToExpenseScreen(item)}
            activeOpacity={0.85}
          >
            <View style={styles.left}>
              <Text style={[styles.title, { color: t.title }]} numberOfLines={1}>{item.logTitle}</Text>
              <Text style={[styles.meta, { color: t.meta }]}>{item.date}  ·  {totalTx} transactions</Text>
            </View>
            <View style={styles.right}>
              <Text style={[styles.amount, { color: t.amount }]}>{formatCurrency(item.totalAmount)}</Text>
              <Ionicons name="chevron-forward" size={18} color={t.chevron} />
            </View>
          </TouchableOpacity>
        </Swipeable>
      </Animated.View>
    );
  }, [openSwipeableId, itemBeingDeleted, slideOutAnim, navigateToExpenseScreen, currentLog, t]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#5C5CFF" />
          <Text style={{ color: t.loaderText, marginTop: 20 }}>Loading log data...</Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={[styles.container, { backgroundColor: t.bg }]}>
        <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]}>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          <View style={[styles.header, { borderBottomColor: t.headerBorder }]}>
            <View>
              <Text style={[styles.headerTitle, { color: t.headerTitle }]}>Logs</Text>
              <Text style={[styles.headerSub, { color: t.searchHolder }]}>{logs.length} log{logs.length !== 1 ? 's' : ''}</Text>
            </View>
            <TouchableOpacity style={styles.addLogBtn} onPress={() => { closeOpenSwipeable(); setSelectedCategoryIds(userCategories.filter(c => !c.isDeleted).map(c => c.id)); setShowNewLogModal(true); }}>
              <Ionicons name="add" size={26} color="#5C5CFF" />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBar, { backgroundColor: t.searchBg, borderColor: t.searchBorder }]}>
            <Ionicons name="search-outline" size={17} color={t.searchHolder} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: t.searchText }]}
              placeholder="Search logs..."
              placeholderTextColor={t.searchHolder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={t.searchHolder} />
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
                <Ionicons name="document-text-outline" size={48} color={t.emptyIcon} style={{ marginBottom: 16 }} />
                <Text style={{ color: t.emptyText, fontSize: 17, textAlign: 'center', marginBottom: 24 }}>
                  {searchQuery.length > 0 ? 'No logs match your search' : "You haven't added any logs yet..."}
                </Text>
                {searchQuery.length === 0 && (
                  <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowNewLogModal(true)} activeOpacity={0.85}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Add Your First Log</Text>
                    <Animated.View
                      pointerEvents="none"
                      style={[StyleSheet.absoluteFill, {
                        borderRadius: 10,
                        overflow: 'hidden',
                        transform: [{
                          translateX: shimmerAnim.interpolate({
                            inputRange: [-1, 2],
                            outputRange: [-120, 280],
                          }),
                        }],
                      }]}
                    >
                      <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.25)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ width: 120, height: '100%' }}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </SafeAreaView>

        <Modal visible={showNewLogModal} animationType="fade" transparent onRequestClose={closeModal}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <TouchableOpacity style={MB.overlay} activeOpacity={1} onPress={closeModal}>
            <View style={[MB.card, { backgroundColor: t.modalCardBg, borderColor: t.modalBorder, maxHeight: modalStep === 2 ? '85%' : undefined }]} onStartShouldSetResponder={() => true}>

              {/* ── Step 1: Name ── */}
              {modalStep === 1 && <>
                <View style={[MB.iconWrap, { backgroundColor: t.modalIconBg }]}>
                  <Ionicons name="document-text-outline" size={32} color="#5C5CFF" />
                </View>
                <TextInput
                  style={[MB.input, { backgroundColor: t.modalInputBg, borderColor: t.modalInputBorder, color: t.modalInputText }]}
                  placeholder="What are you tracking?"
                  placeholderTextColor={t.modalHolder}
                  value={newLogName}
                  onChangeText={setNewLogName}
                  autoFocus
                />
                <TouchableOpacity style={MB.addBtn} onPress={handleNextStep}>
                  <Text style={MB.addTxt}>Next →</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={[MB.cancelTxt, { color: t.modalCancel }]}>Cancel</Text>
                </TouchableOpacity>
              </>}

              {/* ── Step 2: Category picker ── */}
              {modalStep === 2 && <>
                {/* Header */}
                {(() => {
                  const available = userCategories.filter(c => !c.isDeleted).sort((a, b) => a.name.localeCompare(b.name));
                  return (<>
                  <View style={CS.stepHeader}>
                    <View>
                      <Text style={[CS.stepTitle, { color: t.modalInputText }]}>Categories</Text>
                      <Text style={[CS.stepSub, { color: t.modalCancel }]}>{selectedCategoryIds.length} of {available.length} selected</Text>
                    </View>
                  </View>

                  {/* Select All checkbox */}
                  {(() => {
                    const allSelected = available.length > 0 && available.every(c => selectedCategoryIds.includes(c.id));
                    return (
                      <TouchableOpacity
                        style={CS.selAllRow}
                        onPress={() => setSelectedCategoryIds(allSelected ? [] : available.map(c => c.id))}
                        activeOpacity={0.7}
                      >
                        <Text style={[CS.listName, { color: t.modalInputText }]}>Select all</Text>
                        <View style={[CS.checkbox, { borderColor: allSelected ? '#5C5CFF' : t.modalInputBorder, backgroundColor: allSelected ? '#5C5CFF' : 'transparent' }]}>
                          {allSelected && <Ionicons name="checkmark" size={13} color="#fff" />}
                        </View>
                      </TouchableOpacity>
                    );
                  })()}

                  {/* Category list */}
                  <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    <View>
                      {available.map((cat, i) => {
                        const selected = selectedCategoryIds.includes(cat.id);
                        const color = cat.color || '#888';
                        return (
                          <TouchableOpacity
                            key={cat.id}
                            onPress={() => toggleCategory(cat.id)}
                            activeOpacity={0.7}
                            style={[CS.listRow, i < available.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.modalInputBorder }]}
                          >
                            <View style={[CS.listIconCircle, { backgroundColor: color + '28' }]}>
                              <Ionicons name={cat.icon || 'grid-outline'} size={19} color={color} />
                            </View>
                            <Text style={[CS.listName, { color: t.modalInputText }]}>{cat.name}</Text>
                            <View style={[CS.checkbox, { borderColor: selected ? '#5C5CFF' : t.modalInputBorder, backgroundColor: selected ? '#5C5CFF' : 'transparent' }]}>
                              {selected && <Ionicons name="checkmark" size={13} color="#fff" />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={{ height: 16 }} />
                  </ScrollView>
                  </>); })()}

                {/* Action buttons */}
                <View style={CS.stepBtns}>
                  <TouchableOpacity style={[CS.backBtn, { borderColor: t.modalInputBorder }]} onPress={() => setModalStep(1)}>
                    <Text style={[CS.backTxt, { color: t.modalCancel }]}>← Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[CS.createBtn, { opacity: selectedCategoryIds.length === 0 ? 0.4 : 1 }]}
                    onPress={handleCreateNewLog}
                  >
                    <Text style={CS.createTxt}>Create Log</Text>
                  </TouchableOpacity>
                </View>
              </>}

            </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  safe:         { flex: 1, paddingTop: Platform.OS === 'ios' ? 0 : Constants.statusBarHeight },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle:  { fontSize: 22, fontWeight: '700' },
  headerSub:    { fontSize: 13, marginTop: 1 },
  addLogBtn:    { width: 44, height: 44, borderRadius: 22, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#5C5CFF', alignItems: 'center', justifyContent: 'center' },
  searchBar:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginHorizontal: 16, marginTop: 14, marginBottom: 12, paddingHorizontal: 14, height: 46, borderWidth: 1 },
  searchInput:  { flex: 1, fontSize: 17 },
  list:         { paddingHorizontal: 16, paddingBottom: 120 },
  card:         { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 },
  left:         { flex: 1, marginRight: 12 },
  title:        { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  meta:         { fontSize: 13 },
  right:        { alignItems: 'flex-end', gap: 6 },
  amount:       { fontSize: 17, fontWeight: '700' },
  deleteWrap:   { width: 90, marginBottom: 8 },
  deleteBtn:    { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FF3B30', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  deleteTxt:    { color: '#FF3B30', fontWeight: 'bold', fontSize: 13, marginTop: 4 },
  emptyBtn:     { backgroundColor: '#5C5CFF', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10, overflow: 'hidden' },
});

// ── Category Selector (step 2) ────────────────────────────────────────────────
const CS = StyleSheet.create({
  stepHeader:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', marginBottom: 6 },
  stepTitle:      { fontSize: 17, fontWeight: '700' },
  stepSub:        { fontSize: 13, marginTop: 2 },
  selAllRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, width: '100%' },
  listRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  listIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  listName:       { flex: 1, fontSize: 17 },
  checkbox:       { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepBtns:       { flexDirection: 'row', gap: 10, width: '100%', marginTop: 14 },
  backBtn:        { flex: 0.7, height: 46, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backTxt:        { fontWeight: '600', fontSize: 15 },
  createBtn:      { flex: 1, height: 46, borderRadius: 12, backgroundColor: '#5C5CFF', alignItems: 'center', justifyContent: 'center' },
  createTxt:      { color: '#fff', fontWeight: '700', fontSize: 17 },
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
  input:     { width: '100%', backgroundColor: '#1e1e1e', borderRadius: 12, padding: 14, fontSize: 17, color: '#fff', marginBottom: 20, borderWidth: 1, borderColor: '#2a2a2a', textAlign: 'center' },
  addBtn:    { width: '100%', height: 50, borderRadius: 14, backgroundColor: '#5C5CFF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  addTxt:    { color: '#fff', fontWeight: '700', fontSize: 17 },
  cancelTxt: { color: '#555', fontSize: 15, paddingVertical: 4 },
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
