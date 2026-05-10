import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { CategoryIcons } from '../constants/CategoryIcons';
import { useTheme } from '../contexts/ThemeContext';

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

const { height } = Dimensions.get('window');

const TransactionListModal = ({ visible, onClose, category, transactions, onDeleteTransaction }) => {
  const { isDarkMode } = useTheme();
  const swipeableRefs = useRef({});
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [modalVisible, setModalVisible] = useState(false);

  const t = isDarkMode ? {
    sheet:        '#0f0f0f',
    handle:       '#2a2a2a',
    headerBorder: '#1a1a1a',
    headerTitle:  '#fff',
    subTitle:     '#555',
    divider:      '#141414',
    desc:         '#ccc',
    date:         '#555',
    amount:       '#fff',
    empty:        '#444',
    statusBar:    'light-content',
  } : {
    sheet:        '#FFFFFF',
    handle:       '#D8E2EE',
    headerBorder: '#EEF2F7',
    headerTitle:  '#0A1628',
    subTitle:     '#4A6FA5',
    divider:      '#EEF2F7',
    desc:         '#1A2A40',
    date:         '#8BA3C0',
    amount:       '#0A1628',
    empty:        '#A8BACE',
    statusBar:    'dark-content',
  };

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      slideAnim.setValue(height);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setModalVisible(false);
      });
    }
  }, [visible, slideAnim]);

  if (!modalVisible && !visible) return null;
  if (!category) return null;

  const color = CATEGORY_COLORS[category.name] || '#888';
  const catTransactions = (transactions || [])
    .filter(tx => tx.category === category.name)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmt = (n) =>
    Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={onClose}
      supportedOrientations={['portrait']}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, { backgroundColor: t.sheet, transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.handle, { backgroundColor: t.handle }]} />

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: t.headerBorder }]}>
            <Ionicons name={CategoryIcons[category.name]} size={20} color={color} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: t.headerTitle }]}>{category.name}</Text>
              <Text style={[styles.headerSub, { color: t.subTitle }]}>
                ${formatAmt(category.amount)} · {catTransactions.length} transaction{catTransactions.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={22} color={t.subTitle} />
            </TouchableOpacity>
          </View>

          {/* Transaction list */}
          <GestureHandlerRootView>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              {catTransactions.length === 0 ? (
                <View style={styles.empty}>
                  <Ionicons name="receipt-outline" size={40} color={t.empty} style={{ marginBottom: 12 }} />
                  <Text style={[styles.emptyText, { color: t.empty }]}>No transactions yet</Text>
                </View>
              ) : (
                catTransactions.map((tx, i) => {
                  const renderRightActions = () => (
                    <TouchableOpacity
                      style={styles.deleteAction}
                      onPress={() => {
                        Alert.alert('Delete Transaction', `Delete "${tx.description}"?`, [
                          { text: 'Cancel', style: 'cancel', onPress: () => swipeableRefs.current[tx.id]?.close() },
                          { text: 'Delete', style: 'destructive', onPress: () => onDeleteTransaction(tx.id) },
                        ]);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                  );

                  return (
                    <Swipeable
                      key={tx.id}
                      ref={ref => swipeableRefs.current[tx.id] = ref}
                      renderRightActions={renderRightActions}
                      overshootRight={false}
                    >
                      <View
                        style={[
                          styles.row,
                          { backgroundColor: t.sheet },
                          i < catTransactions.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.divider },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.desc, { color: t.desc }]}>{tx.description}</Text>
                          <Text style={[styles.date, { color: t.date }]}>{formatDate(tx.date)}</Text>
                        </View>
                        <Text style={[styles.amount, { color: t.amount }]}>${formatAmt(tx.amount)}</Text>
                      </View>
                    </Swipeable>
                  );
                })
              )}
            </ScrollView>
          </GestureHandlerRootView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  dismissArea:  { flex: 1 },
  sheet:        { height: height * 0.72, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  handle:       { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle:  { fontSize: 17, fontWeight: '700' },
  headerSub:    { fontSize: 13, marginTop: 2 },
  row:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  desc:         { fontSize: 17, fontWeight: '400', marginBottom: 3 },
  date:         { fontSize: 13 },
  amount:       { fontSize: 17, fontWeight: '600' },
  empty:        { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText:    { fontSize: 17 },
  deleteAction: { backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center', width: 72 },
});

export default TransactionListModal;
