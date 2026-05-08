import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import CategorySelectorModal from '../../components/CategorySelectorModal';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CategoryIcons } from '../../constants/CategoryIcons';

const { width, height } = Dimensions.get('window');

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

export default function ExpenseTracker() {
  const { user, logs, currentLog, updateLog, isLoading } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();

  const [logTitle, setlogTitle]                   = useState(currentLog ? currentLog.logTitle   : 'New Trip');
  const [totalAmount, setTotalAmount]             = useState(currentLog ? currentLog.totalAmount : 0);
  const [categories, setCategories]               = useState(currentLog ? currentLog.categories  : {});
  const [selectedCategory, setSelectedCategory]   = useState({});

  useEffect(() => {
    console.log('loginScreen useEffect');
    console.log('currentLog:', currentLog);
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

  if (isLoading && !currentLog) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={{ color: theme.text, marginTop: 20 }}>Loading log data...</Text>
        </View>
      </View>
    );
  }

  if (!currentLog) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="document-text-outline" size={80} color="#555" style={{ marginBottom: 20 }} />
          <Text style={styles.noLogTitle}>No Log Selected</Text>
          <Text style={styles.noLogDesc}>You need to create a log before you can add expenses to it.</Text>
          <TouchableOpacity style={styles.createLogBtn} onPress={() => router.replace('/(main)/screen2')}>
            <Ionicons name="add-circle-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.createLogBtnText}>CREATE A LOG</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logTitle}>{logTitle}</Text>
          <Text style={styles.totalAmount}>${formatAmt(totalAmount)}</Text>
          <View style={styles.quickRow}>
            {QUICK_BTNS.map((btn, i) => (
              <TouchableOpacity key={i} style={styles.quickBtn} onPress={() => Alert.alert(btn.label, 'Coming soon.', [{ text: 'OK' }])}>
                <Ionicons name={btn.icon} size={24} color="#aaa" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', marginBottom: 14 }}>
            <View style={{ flex: 0.75 }}>
              <Text style={styles.label}>AMOUNT</Text>
              <View style={styles.amountRow}>
                <Text style={styles.dollar}>$</Text>
                <TextInput
                  style={styles.input}
                  value={inputAmount}
                  onChangeText={handleAmountChange}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#555"
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>CATEGORY</Text>
              <TouchableOpacity style={styles.catBtn} onPress={openCategoryModal}>
                <Text style={[styles.catBtnText, selectedCategory.name && { color: '#fff' }]}>
                  {selectedCategory.name || 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput
            style={styles.descInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            placeholderTextColor="#555"
          />

          <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearForm}>
              <Text style={styles.clearBtnText}>CLEAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logBtn} onPress={handleLogExpense}>
              <Text style={styles.logBtnText}>LOG</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category list */}
        <View style={styles.card}>
          {Array.isArray(categories) && categories.map((cat, i) => {
            const color = CATEGORY_COLORS[cat.name] || '#888';
            return (
              <View key={cat.id} style={[styles.catRow, i < categories.length - 1 && styles.catDivider]}>
                <Ionicons name={CategoryIcons[cat.name]} size={20} color={color} style={{ marginRight: 14 }} />
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catAmt}>${formatAmt(cat.amount)}</Text>
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

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#0f0f0f' },
  scroll:           { paddingBottom: 40 },
  header:           { marginHorizontal: 16, marginTop: 20, marginBottom: 4, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
  logTitle:         { fontSize: 16, color: '#888', fontWeight: '500', marginBottom: 4 },
  totalAmount:      { fontSize: 42, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  quickRow:         { flexDirection: 'row', gap: 12 },
  quickBtn:         { width: 48, height: 48, borderRadius: 12, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  card:             { marginHorizontal: 16, marginTop: 16, backgroundColor: '#141414', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#222' },
  label:            { fontSize: 11, fontWeight: '700', color: '#555', letterSpacing: 1, marginBottom: 6 },
  amountRow:        { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e1e', borderRadius: 10, paddingHorizontal: 12, height: 46, marginRight: 8 },
  dollar:           { color: '#666', fontSize: 16, marginRight: 4 },
  input:            { flex: 1, color: '#fff', fontSize: 16 },
  catBtn:           { backgroundColor: '#1e1e1e', borderRadius: 10, height: 46, justifyContent: 'center', paddingHorizontal: 12 },
  catBtnText:       { color: '#555', fontSize: 14 },
  descInput:        { backgroundColor: '#1e1e1e', borderRadius: 10, padding: 12, color: '#fff', fontSize: 15 },
  clearBtn:         { flex: 0.75, height: 46, borderRadius: 10, borderWidth: 1, borderColor: '#ff4444', alignItems: 'center', justifyContent: 'center' },
  clearBtnText:     { color: '#ff4444', fontWeight: '600' },
  logBtn:           { flex: 1, height: 46, borderRadius: 10, backgroundColor: '#5C5CFF', alignItems: 'center', justifyContent: 'center' },
  logBtnText:       { color: '#fff', fontWeight: '700', fontSize: 15 },
  catRow:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  catDivider:       { borderBottomWidth: 1, borderBottomColor: '#1e1e1e' },
  catName:          { flex: 1, color: '#ccc', fontSize: 15 },
  catAmt:           { color: '#fff', fontSize: 15, fontWeight: '600' },
  noLogTitle:       { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  noLogDesc:        { fontSize: 16, lineHeight: 22, textAlign: 'center', color: '#888', maxWidth: 300, marginBottom: 30 },
  createLogBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#5C5CFF', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, width: '80%', maxWidth: 300, height: 56, marginTop: 20 },
  createLogBtnText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
});
