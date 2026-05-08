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
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [modalVisible, setModalVisible] = useState(false);

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
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Category</Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {categories.map((category, index) => {
              const color = CATEGORY_COLORS[category.name] || '#888';
              const isSelected = selectedCategory?.name === category.name;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.row, index < categories.length - 1 && styles.divider]}
                  onPress={() => handleSelect(category)}
                  activeOpacity={0.6}
                >
                  <Ionicons name={CategoryIcons[category.name]} size={18} color={isSelected ? color : '#555'} style={{ marginRight: 14 }} />
                  <Text style={[styles.name, isSelected && { color }]}>{category.name}</Text>
                  <Text style={[styles.amount, isSelected && { color, opacity: 1 }]}>
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
  sheet:       { height: height * 0.72, backgroundColor: '#0f0f0f', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  handle:      { width: 36, height: 4, backgroundColor: '#2a2a2a', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  headerTitle: { fontSize: 13, fontWeight: '700', color: '#555', letterSpacing: 1.2, textTransform: 'uppercase' },
  row:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20 },
  divider:     { borderBottomWidth: 1, borderBottomColor: '#141414' },
  name:        { flex: 1, fontSize: 15, color: '#777', fontWeight: '400' },
  amount:      { fontSize: 14, color: '#444', fontWeight: '500', opacity: 0.8 },
});

export default CategorySelectorModal;
