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
  StatusBar
} from 'react-native';
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

const CategorySelectorModal = ({ visible, onClose, onSelect, categories, selectedCategory }) => {
  const { isDarkMode } = useTheme();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [modalVisible, setModalVisible] = useState(false);

  const t = isDarkMode ? {
    sheet:        '#0f0f0f',
    handle:       '#2a2a2a',
    headerBorder: '#1a1a1a',
    headerTitle:  '#555',
    divider:      '#141414',
    name:         '#777',
    amount:       '#444',
    icon:         '#555',
    selectedText: '#ffffff',
    statusBar:    'light-content',
  } : {
    sheet:        '#FFFFFF',
    handle:       '#D8E2EE',
    headerBorder: '#EEF2F7',
    headerTitle:  '#4A6FA5',
    divider:      '#EEF2F7',
    name:         '#1A2A40',
    amount:       '#4A6FA5',
    icon:         '#8BA3C0',
    selectedText: '#0A1628',
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

  const handleSelect = (category) => {
    onSelect(category);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={onClose}
      supportedOrientations={['portrait']}
    >
      <StatusBar barStyle={t.statusBar} />
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, { backgroundColor: t.sheet, transform: [{ translateY: slideAnim }] }]}>
          <View style={[styles.handle, { backgroundColor: t.handle }]} />
          <View style={[styles.header, { borderBottomColor: t.headerBorder }]}>
            <Text style={[styles.headerTitle, { color: t.headerTitle }]}>Category Select</Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {[...categories].sort((a, b) => b.amount - a.amount).map((category, index) => {
              const color = CATEGORY_COLORS[category.name] || '#888';
              const isSelected = selectedCategory?.name === category.name;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.row, index < categories.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.divider }]}
                  onPress={() => handleSelect(category)}
                  activeOpacity={0.6}
                >
                  <Ionicons name={CategoryIcons[category.name]} size={18} color={color} style={{ marginRight: 14 }} />
                  <Text style={[styles.name, { color: isSelected ? t.selectedText : t.name }]}>{category.name}</Text>
                  <Text style={[styles.amount, { color: isSelected ? t.selectedText : t.amount, opacity: isSelected ? 1 : 0.8 }]}>
                    ${category.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  sheet:       { height: height * 0.72, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  handle:      { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  row:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  name:        { flex: 1, fontSize: 15, fontWeight: '400' },
  amount:      { fontSize: 14, fontWeight: '500' },
});

export default CategorySelectorModal;
