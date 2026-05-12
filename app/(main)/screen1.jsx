import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Animated
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CategorySelectorModal from '../../components/CategorySelectorModal';
import TransactionListModal from '../../components/TransactionListModal';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CategoryIcons } from '../../constants/CategoryIcons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const CATEGORY_COLORS = {
  'Restaurants':    '#FF6B6B',
  'Fast Food':      '#FF8E53',
  'Gifts':          '#FF6BD6',
  'Health/Medical': '#4ECDC4',
  'Home':           '#45B7D1',
  'Transportation': '#96CEB4',
  'Personal':       '#A78BFA',
  'Pets':           '#FFA07A',
  'Utilities':      '#FFD93D',
  'Entertainment':  '#6BCB77',
  'Groceries':      '#4D96FF',
};

const QUICK_BTNS = [
  { icon: 'analytics-outline',  label: 'Analytics' },
  { icon: 'list-outline',       label: 'View Chart' },
  { icon: 'pie-chart-outline',  label: 'View Stats' },
  { icon: 'add-circle-outline', label: 'Add Category', action: 'addCategory' },
];


// Color tokens per design
const THEMES = {
  dark: {
    bg:               '#0f0f0f',
    headerBorder:     '#222',
    logTitle:         '#888',
    totalAmount:      '#fff',
    quickBtnBg:       '#1a1a1a',
    quickIcon:        '#aaa',
    cardBg:           '#141414',
    cardBorder:       '#222',
    label:            '#fff',
    fieldBg:          '#1e1e1e',
    fieldBorder:      '#1e1e1e',
    dollar:           '#666',
    inputText:        '#fff',
    placeholder:      '#555',
    catSelected:      '#fff',
    catPlaceholder:   '#555',
    clearBorder:      '#ff4444',
    clearText:        '#ff4444',
    logBtnBg:         '#5C5CFF',
    catDivider:       '#1e1e1e',
    catName:          '#ccc',
    catAmt:           '#fff',
  },
  light3: {
    bg:               '#EEF2F7',
    headerBorder:     '#D8E2EE',
    logTitle:         '#4A6FA5',
    totalAmount:      '#0A1628',
    quickBtnBg:       '#DDE6F0',
    quickIcon:        '#4A6FA5',
    cardBg:           '#FFFFFF',
    cardBorder:       '#D8E2EE',
    label:            '#4A6FA5',
    fieldBg:          '#EEF2F7',
    fieldBorder:      '#D8E2EE',
    dollar:           '#1A2A40',
    inputText:        '#0A1628',
    placeholder:      '#A8BACE',
    catSelected:      '#0A1628',
    catPlaceholder:   '#7A9AB8',
    clearBorder:      '#E07070',
    clearText:        '#E07070',
    logBtnBg:         '#5C5CFF',
    catDivider:       '#D8E2EE',
    catName:          '#1A2A40',
    catAmt:           '#0A1628',
  },
};

export default function ExpenseTracker() {
  const { user, logs, currentLog, updateLog, deleteTransaction, deleteCategory, addCategoriesToLog, userCategories, isLoading } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();

  const [logTitle, setlogTitle]                   = useState(currentLog ? currentLog.logTitle   : 'New Trip');
  const [totalAmount, setTotalAmount]             = useState(currentLog ? currentLog.totalAmount : 0);
  const [categories, setCategories]               = useState(currentLog ? currentLog.categories  : {});
  const [selectedCategory, setSelectedCategory]   = useState({});

  useEffect(() => {
    if (currentLog) {
      setlogTitle(currentLog.logTitle);
      setTotalAmount(currentLog.totalAmount);
      setCategories(currentLog.categories);
      setSelectedCategory({});
    }
  }, [logs, currentLog]);

  const [inputAmount, setInputAmount]                   = useState('');
  const [description, setDescription]                   = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [txModalCategory, setTxModalCategory]           = useState(null);
  const [addCatVisible, setAddCatVisible]   = useState(false);
  const [addCatSelected, setAddCatSelected] = useState([]);
  const [addCatSearch, setAddCatSearch]     = useState('');
  const rowAnims                                        = useRef({});
  const prevSortedIds                                   = useRef(null);
  const swipeCatRefs                                    = useRef({});
  const ROW_HEIGHT                                      = 45;
  const shakeAmount                                     = useRef(new Animated.Value(0)).current;
  const shakeCategory                                   = useRef(new Animated.Value(0)).current;
  const shakeDesc                                       = useRef(new Animated.Value(0)).current;

  const triggerShake = (anim) => {
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue:  6, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue: -2, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue:  2, duration: 50, useNativeDriver: true }),
      Animated.timing(anim, { toValue:  0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleAmountChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '') { setInputAmount(''); return; }
    const cents = parseInt(numericValue);
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
    setInputAmount(formattedAmount);
  };

  const openCategoryModal    = () => setCategoryModalVisible(true);
  const closeCategoryModal   = () => setCategoryModalVisible(false);
  const handleCategorySelect = (category) => { setSelectedCategory(category); closeCategoryModal(); };

  const handleLogExpense = () => {
    if (!inputAmount || !description || !selectedCategory || !selectedCategory.name) {
      Alert.alert('Missing Information', 'Please enter an amount, description, and select a category.', [{ text: 'OK' }]);
      return;
    }
    updateLog(inputAmount, description, selectedCategory.name, new Date(), selectedCategory.categoryId);
    setInputAmount('');
    setDescription('');
    setSelectedCategory({});
  };

  const handleClearForm = () => { setInputAmount(''); setDescription(''); setSelectedCategory({}); };

  const openAddCatModal = () => { setAddCatSelected([]); setAddCatSearch(''); setAddCatVisible(true); };
  const closeAddCatModal = () => { setAddCatVisible(false); setAddCatSelected([]); setAddCatSearch(''); };
  const toggleAddCatSelect = (id) => setAddCatSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const handleAddCategories = async () => {
    if (addCatSelected.length === 0) return;
    const toAdd = userCategories
      .filter(c => addCatSelected.includes(c.id) && !c.isDeleted)
      .map(c => ({ categoryId: c.id, name: c.name, icon: c.icon, color: c.color, amount: 0, percentage: 0, transactionCount: 0 }));
    await addCategoriesToLog(toAdd);
    closeAddCatModal();
  };
  const formatAmt = (n) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const t = isDarkMode ? THEMES.dark : THEMES.light3;

  if (isLoading && !currentLog) {
    return (
      <View style={[s.container, { backgroundColor: t.bg }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#5C5CFF" />
          <Text style={{ color: t.totalAmount, marginTop: 20 }}>Loading log data...</Text>
        </View>
      </View>
    );
  }

  if (!currentLog) {
    return (
      <View style={[s.container, { backgroundColor: t.bg }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="document-text-outline" size={80} color={t.label} style={{ marginBottom: 20 }} />
          <Text style={[s.noLogTitle, { color: t.totalAmount }]}>No Log Selected</Text>
          <Text style={[s.noLogDesc,  { color: t.logTitle }]}>You need to create a log before you can add expenses to it.</Text>
          <TouchableOpacity style={s.createLogBtn} onPress={() => router.replace('/(main)/screen2')}>
            <Ionicons name="add-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={s.createLogBtnText}>CREATE A LOG</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={[s.container, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={[s.header, { borderBottomColor: t.headerBorder }]}>

          {/* Log title: left accent bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <View style={s.hdAccentBar} />
            <Text style={[s.hdTitleD3, { color: t.totalAmount }]}>{logTitle}</Text>
          </View>

          <Text style={[s.totalAmount, { color: t.totalAmount }]}>${formatAmt(totalAmount)}</Text>
          <View style={s.quickRow}>
            {QUICK_BTNS.map((btn, i) => (
              <TouchableOpacity key={i} style={[s.quickBtn, { backgroundColor: t.quickBtnBg }]} onPress={() => btn.action === 'addCategory' ? openAddCatModal() : Alert.alert(btn.label, 'Coming soon.', [{ text: 'OK' }])}>
                <Ionicons name={btn.icon} size={24} color={t.quickIcon} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={[s.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
          <View style={{ flexDirection: 'row', marginBottom: 14, gap: 8 }}>
            <View style={{ flex: 0.75 }}>
              <Text style={[s.label, { color: t.label }]}>AMOUNT</Text>
              <Animated.View style={[s.amountRow, { backgroundColor: t.fieldBg, borderColor: t.fieldBorder, transform: [{ translateX: shakeAmount }] }]}>
                <Text style={[s.dollar, { color: t.dollar }]}>$</Text>
                <TextInput
                  style={[s.input, { color: t.inputText }]}
                  value={inputAmount}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={t.placeholder}
                />
              </Animated.View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.label, { color: t.label }]}>CATEGORY</Text>
              <Animated.View style={{ transform: [{ translateX: shakeCategory }] }}>
                <TouchableOpacity style={[s.catBtn, { backgroundColor: t.fieldBg, borderColor: t.fieldBorder }]} onPress={openCategoryModal}>
                  <Text style={[s.catBtnText, { color: selectedCategory.name ? t.catSelected : t.catPlaceholder }]}>
                    {selectedCategory.name || ''}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>

          <Text style={[s.label, { color: t.label }]}>DESCRIPTION</Text>
          <Animated.View style={{ transform: [{ translateX: shakeDesc }] }}>
            <TextInput
              style={[s.descInput, { backgroundColor: t.fieldBg, borderColor: t.fieldBorder, color: t.inputText }]}
              value={description}
              onChangeText={setDescription}
              placeholder=""
              placeholderTextColor={t.placeholder}
            />
          </Animated.View>

          {(() => {
            const amountFilled = !!inputAmount && inputAmount !== '0.00';
            const enabled = amountFilled && !!description && !!selectedCategory.name;
            return (
              <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
                <TouchableOpacity style={[s.clearBtn, { borderColor: t.clearBorder }]} onPress={handleClearForm}>
                  <Text style={[s.clearBtnText, { color: t.clearText }]}>CLEAR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.logBtn, { backgroundColor: enabled ? t.logBtnBg : t.fieldBg, borderWidth: enabled ? 0 : 1, borderColor: t.fieldBorder }]}
                  onPress={enabled ? handleLogExpense : () => {
                    if (!amountFilled) triggerShake(shakeAmount);
                    if (!selectedCategory.name) triggerShake(shakeCategory);
                    if (!description) triggerShake(shakeDesc);
                  }}
                  activeOpacity={enabled ? 0.7 : 1}
                >
                  <Text style={[s.logBtnText, { color: enabled ? '#fff' : t.placeholder }]}>LOG</Text>
                </TouchableOpacity>
              </View>
            );
          })()}
        </View>

        {/* Category list */}
        <View style={[s.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder, padding: 0, overflow: 'hidden' }]}>
          {(() => {
            if (!Array.isArray(categories)) return null;
            const sorted = [...categories].sort((a, b) => b.amount - a.amount);
            const newIds = sorted.map(c => c.categoryId || String(c.id));

            // Initialise any new anim values
            sorted.forEach(cat => {
              const k = cat.categoryId || String(cat.id);
              if (!rowAnims.current[k]) rowAnims.current[k] = new Animated.Value(0);
            });

            // Animate rows that changed position
            if (prevSortedIds.current) {
              const prev = prevSortedIds.current;
              const anims = sorted
                .map((cat, newIdx) => {
                  const k = cat.categoryId || String(cat.id);
                  const oldIdx = prev.indexOf(k);
                  if (oldIdx === -1 || oldIdx === newIdx) return null;
                  const anim = rowAnims.current[k];
                  anim.setValue((oldIdx - newIdx) * ROW_HEIGHT);
                  return Animated.spring(anim, { toValue: 0, tension: 120, friction: 9, useNativeDriver: true });
                })
                .filter(Boolean);
              if (anims.length) Animated.parallel(anims).start();
            }
            prevSortedIds.current = newIds;

            return sorted.map((cat, i) => {
            const k = cat.categoryId || String(cat.id);
            const color = cat.color || CATEGORY_COLORS[cat.name] || '#888';
            return (
              <Swipeable
                key={k}
                ref={ref => swipeCatRefs.current[k] = ref}
                overshootRight={false}
                renderRightActions={() => (
                  <TouchableOpacity
                    style={s.catDeleteAction}
                    onPress={() => {
                      console.log('[screen1] trash pressed, cat:', cat.name, 'categoryId:', cat.categoryId, 'id:', cat.id);
                      Alert.alert(
                        'Delete Category',
                        `Delete "${cat.name}" and all its transactions?`,
                        [
                          { text: 'Cancel', style: 'cancel', onPress: () => swipeCatRefs.current[k]?.close() },
                          { text: 'Delete', style: 'destructive', onPress: () => {
                            console.log('[screen1] Delete confirmed, calling deleteCategory with:', cat.categoryId || cat.id);
                            deleteCategory(cat.categoryId || cat.id);
                          }},
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              >
                <Animated.View style={[s.catRow, i < sorted.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.catDivider }, { backgroundColor: t.cardBg, transform: [{ translateY: rowAnims.current[k] }] }]}>
                  <TouchableOpacity style={s.catRowInner} activeOpacity={0.6} onPress={() => setTxModalCategory(cat)}>
                    <Ionicons name={cat.icon || CategoryIcons[cat.name] || 'grid-outline'} size={20} color={color} style={{ marginRight: 14 }} />
                    <Text style={[s.catName, { color: t.catName }]}>{cat.name}</Text>
                    <Text style={[s.catAmt, { color: t.catAmt }]}>${formatAmt(cat.amount)}</Text>
                  </TouchableOpacity>
                </Animated.View>
              </Swipeable>
            );
            });
          })()}
        </View>

      </ScrollView>

      <CategorySelectorModal
        visible={categoryModalVisible}
        onClose={closeCategoryModal}
        onSelect={handleCategorySelect}
        categories={categories}
        selectedCategory={selectedCategory}
      />

      <TransactionListModal
        visible={!!txModalCategory}
        onClose={() => setTxModalCategory(null)}
        category={txModalCategory}
        transactions={currentLog?.transactions}
        onDeleteTransaction={deleteTransaction}
      />

      {/* ── Add Category Modal ── */}
      {(() => {
        const existingCatIds = new Set((currentLog?.categories || []).map(c => c.categoryId));
        const available = userCategories.filter(c => !c.isDeleted && !existingCatIds.has(c.id))
          .sort((a, b) => a.name.localeCompare(b.name));
        const filteredAvailable = addCatSearch.length >= 2
          ? available.filter(c => c.name.toLowerCase().includes(addCatSearch.toLowerCase()))
          : available;
        return (
          <Modal visible={addCatVisible} transparent animationType="fade" onRequestClose={closeAddCatModal}>
            <TouchableOpacity style={[ac.overlay, { justifyContent: 'flex-end' }]} activeOpacity={1} onPress={closeAddCatModal}>
              <View style={[ac.card, ac.cardSheet, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]} onStartShouldSetResponder={() => true}>
                <View style={[ac.handle, { backgroundColor: t.fieldBorder }]} />

                <View style={ac.header}>
                  <Text style={[ac.title, { color: t.inputText }]}>Add Category</Text>
                  <Text style={[ac.sub, { color: t.placeholder }]}>
                    {addCatSelected.length > 0 ? `${addCatSelected.length} selected` : available.length === 0 ? 'All added' : 'Tap to select'}
                  </Text>
                </View>

                {available.length === 0 ? (
                  <View style={ac.empty}>
                    <Ionicons name="checkmark-circle-outline" size={40} color={t.placeholder} style={{ marginBottom: 10 }} />
                    <Text style={[ac.emptyTxt, { color: t.placeholder }]}>All categories already added</Text>
                  </View>
                ) : (
                  <>
                  <View style={[ac.searchRow, { backgroundColor: t.fieldBg, borderColor: t.fieldBorder }]}>
                    <Ionicons name="search-outline" size={16} color={t.placeholder} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[ac.searchInput, { color: t.inputText }]}
                      placeholder="Search categories..."
                      placeholderTextColor={t.placeholder}
                      value={addCatSearch}
                      onChangeText={setAddCatSearch}
                      returnKeyType="search"
                      clearButtonMode="while-editing"
                    />
                  </View>
                  <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                    {filteredAvailable.map((cat, i) => {
                      const sel   = addCatSelected.includes(cat.id);
                      const color = cat.color || '#888';
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => toggleAddCatSelect(cat.id)}
                          activeOpacity={0.7}
                          style={[ac.listRow, i < filteredAvailable.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.catDivider }]}
                        >
                          <View style={[ac.iconCircle, { backgroundColor: color + '28' }]}>
                            <Ionicons name={cat.icon || 'grid-outline'} size={19} color={color} />
                          </View>
                          <Text style={[ac.listName, { color: t.catName }]}>{cat.name}</Text>
                          <View style={[ac.checkbox, { borderColor: sel ? '#5C5CFF' : t.fieldBorder, backgroundColor: sel ? '#5C5CFF' : 'transparent' }]}>
                            {sel && <Ionicons name="checkmark" size={13} color="#fff" />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                    <View style={{ height: 12 }} />
                  </ScrollView>
                  </>
                )}

                <TouchableOpacity
                  style={[ac.addBtn, { opacity: addCatSelected.length === 0 ? 0.4 : 1 }]}
                  onPress={handleAddCategories}
                >
                  <Text style={ac.addTxt}>
                    {addCatSelected.length > 0 ? `Add ${addCatSelected.length} Categor${addCatSelected.length === 1 ? 'y' : 'ies'}` : 'Add Categories'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        );
      })()}
    </View>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1 },
  scroll:           { paddingBottom: 40 },
  header:           { marginHorizontal: 16, marginTop: 20, marginBottom: 4, paddingBottom: 20, borderBottomWidth: 1 },
  // Header
  hdAccentBar:      { width: 4, height: 34, borderRadius: 2, backgroundColor: '#5C5CFF', marginRight: 12 },
  hdTitleD3:        { fontSize: 24, fontWeight: '700' },
  totalAmount:      { fontSize: 42, fontWeight: 'bold', marginBottom: 20 },
  quickRow:         { flexDirection: 'row', gap: 12 },
  quickBtn:         { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  card:             { marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
  label:            { fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  amountRow:        { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, height: 46, borderWidth: 1 },
  dollar:           { fontSize: 17, marginRight: 4 },
  input:            { flex: 1, fontSize: 17 },
  catBtn:           { borderRadius: 10, height: 46, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1 },
  catBtnText:       { fontSize: 16 },
  descInput:        { borderRadius: 10, padding: 12, fontSize: 16, borderWidth: 1 },
  clearBtn:         { flex: 0.75, height: 46, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  clearBtnText:     { fontWeight: '600', fontSize: 15 },
  logBtn:           { flex: 1, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logBtnText:       { color: '#fff', fontWeight: '700', fontSize: 17 },
  catRow:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  catRowInner:      { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  catDeleteAction:  { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FF3B30', borderRadius: 10, justifyContent: 'center', alignItems: 'center', width: 64, marginRight: 8 },
  catName:          { flex: 1, fontSize: 17 },
  catAmt:           { fontSize: 17, fontWeight: '600' },
  noLogTitle:       { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  noLogDesc:        { fontSize: 17, lineHeight: 24, textAlign: 'center', maxWidth: 300, marginBottom: 30 },
  createLogBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#5C5CFF', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, width: '80%', maxWidth: 300, height: 56, marginTop: 20 },
  createLogBtnText: { color: '#FFF', fontWeight: '600', fontSize: 17 },
});

const ac = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' },
  card:       { margin: 16, borderRadius: 24, padding: 20, borderWidth: 1, maxHeight: '80%' },
  cardSheet:  { margin: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: 20, paddingBottom: 32 },
  handle:     { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  header:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  title:      { fontSize: 17, fontWeight: '700' },
  sub:        { fontSize: 12, marginTop: 2 },
  // Search
  searchRow:  { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 40, marginBottom: 8 },
  searchInput: { flex: 1, fontSize: 15 },
  // List
  listRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  listName:   { flex: 1, fontSize: 15 },
  checkbox:   { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  // Add button
  addBtn:     { marginTop: 16, height: 48, borderRadius: 14, backgroundColor: '#5C5CFF', alignItems: 'center', justifyContent: 'center', width: '100%' },
  addTxt:     { color: '#fff', fontWeight: '700', fontSize: 15 },
  // Empty
  empty:      { alignItems: 'center', paddingVertical: 32 },
  emptyTxt:   { fontSize: 14 },
});
