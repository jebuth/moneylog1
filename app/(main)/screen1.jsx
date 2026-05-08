import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CategorySelectorModal from '../../components/CategorySelectorModal';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CategoryIcons } from '../../constants/CategoryIcons';

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
  { icon: 'analytics-outline', label: 'Analytics' },
  { icon: 'list-outline',      label: 'View Chart' },
  { icon: 'pie-chart-outline', label: 'View Stats' },
  { icon: 'duplicate-outline', label: 'Duplicate Log' },
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
    label:            '#555',
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
  const { user, logs, currentLog, updateLog, isLoading } = useAuth();
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
    updateLog(inputAmount, description, selectedCategory.name, new Date());
    setInputAmount('');
    setDescription('');
    setSelectedCategory({});
  };

  const handleClearForm = () => { setInputAmount(''); setDescription(''); setSelectedCategory({}); };
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
    <View style={[s.container, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[s.header, { borderBottomColor: t.headerBorder }]}>
          <Text style={[s.logTitle, { color: t.logTitle }]}>{logTitle}</Text>
          <Text style={[s.totalAmount, { color: t.totalAmount }]}>${formatAmt(totalAmount)}</Text>
          <View style={s.quickRow}>
            {QUICK_BTNS.map((btn, i) => (
              <TouchableOpacity key={i} style={[s.quickBtn, { backgroundColor: t.quickBtnBg }]} onPress={() => Alert.alert(btn.label, 'Coming soon.', [{ text: 'OK' }])}>
                <Ionicons name={btn.icon} size={24} color={t.quickIcon} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={[s.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
          <View style={{ flexDirection: 'row', marginBottom: 14 }}>
            <View style={{ flex: 0.75 }}>
              <Text style={[s.label, { color: t.label }]}>AMOUNT</Text>
              <View style={[s.amountRow, { backgroundColor: t.fieldBg, borderColor: t.fieldBorder }]}>
                <Text style={[s.dollar, { color: t.dollar }]}>$</Text>
                <TextInput
                  style={[s.input, { color: t.inputText }]}
                  value={inputAmount}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={t.placeholder}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.label, { color: t.label }]}>CATEGORY</Text>
              <TouchableOpacity style={[s.catBtn, { backgroundColor: t.fieldBg, borderColor: t.fieldBorder }]} onPress={openCategoryModal}>
                <Text style={[s.catBtnText, { color: selectedCategory.name ? t.catSelected : t.catPlaceholder }]}>
                  {selectedCategory.name || 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[s.label, { color: t.label }]}>DESCRIPTION</Text>
          <TextInput
            style={[s.descInput, { backgroundColor: t.fieldBg, borderColor: t.fieldBorder, color: t.inputText }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            placeholderTextColor={t.placeholder}
          />

          <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
            <TouchableOpacity style={[s.clearBtn, { borderColor: t.clearBorder }]} onPress={handleClearForm}>
              <Text style={[s.clearBtnText, { color: t.clearText }]}>CLEAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.logBtn, { backgroundColor: t.logBtnBg }]} onPress={handleLogExpense}>
              <Text style={s.logBtnText}>LOG</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category list */}
        <View style={[s.card, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
          {Array.isArray(categories) && categories.map((cat, i) => {
            const color = CATEGORY_COLORS[cat.name] || '#888';
            return (
              <View key={cat.id} style={[s.catRow, i < categories.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.catDivider }]}>
                <Ionicons name={CategoryIcons[cat.name]} size={20} color={color} style={{ marginRight: 14 }} />
                <Text style={[s.catName, { color: t.catName }]}>{cat.name}</Text>
                <Text style={[s.catAmt, { color: t.catAmt }]}>${formatAmt(cat.amount)}</Text>
              </View>
            );
          })}
        </View>

      </ScrollView>

      <CategorySelectorModal
        visible={categoryModalVisible}
        onClose={closeCategoryModal}
        onSelect={handleCategorySelect}
        categories={categories}
        selectedCategory={selectedCategory}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1 },
  scroll:           { paddingBottom: 40 },
  header:           { marginHorizontal: 16, marginTop: 20, marginBottom: 4, paddingBottom: 20, borderBottomWidth: 1 },
  logTitle:         { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  totalAmount:      { fontSize: 42, fontWeight: 'bold', marginBottom: 20 },
  quickRow:         { flexDirection: 'row', gap: 12 },
  quickBtn:         { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  card:             { marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
  label:            { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  amountRow:        { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, height: 46, marginRight: 8, borderWidth: 1 },
  dollar:           { fontSize: 16, marginRight: 4 },
  input:            { flex: 1, fontSize: 16 },
  catBtn:           { borderRadius: 10, height: 46, justifyContent: 'center', paddingHorizontal: 12, borderWidth: 1 },
  catBtnText:       { fontSize: 14 },
  descInput:        { borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1 },
  clearBtn:         { flex: 0.75, height: 46, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  clearBtnText:     { fontWeight: '600' },
  logBtn:           { flex: 1, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  logBtnText:       { color: '#fff', fontWeight: '700', fontSize: 15 },
  catRow:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  catName:          { flex: 1, fontSize: 15 },
  catAmt:           { fontSize: 15, fontWeight: '600' },
  noLogTitle:       { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  noLogDesc:        { fontSize: 16, lineHeight: 22, textAlign: 'center', maxWidth: 300, marginBottom: 30 },
  createLogBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#5C5CFF', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, width: '80%', maxWidth: 300, height: 56, marginTop: 20 },
  createLogBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});
