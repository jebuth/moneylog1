import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Screen4() {
  const { userCategories, createUserCategory, softDeleteCategory } = useAuth();
  const { isDarkMode } = useTheme();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const swipeRefs = useRef({});

  const t = isDarkMode ? {
    bg:           '#0a0a0a',
    header:       '#0a0a0a',
    headerBorder: '#1a1a1a',
    title:        '#ffffff',
    subtitle:     '#555',
    row:          '#0f0f0f',
    rowBorder:    '#141414',
    name:         '#e0e0e0',
    badge:        '#1e1e2e',
    badgeText:    '#5C5CFF',
    icon:         '#444',
    addBtn:       '#5C5CFF',
    modal:        '#111',
    modalBorder:  '#222',
    inputBg:      '#1a1a1a',
    inputText:    '#fff',
    inputBorder:  '#333',
    placeholder:  '#444',
    cancelText:   '#888',
    checkBorder:  '#333',
  } : {
    bg:           '#F4F7FB',
    header:       '#F4F7FB',
    headerBorder: '#E4EBF5',
    title:        '#0A1628',
    subtitle:     '#8BA3C0',
    row:          '#FFFFFF',
    rowBorder:    '#EEF2F7',
    name:         '#1A2A40',
    badge:        '#EEF2F7',
    badgeText:    '#4A6FA5',
    icon:         '#C0CFDF',
    addBtn:       '#5C5CFF',
    modal:        '#FFFFFF',
    modalBorder:  '#EEF2F7',
    inputBg:      '#F4F7FB',
    inputText:    '#0A1628',
    inputBorder:  '#D8E2EE',
    placeholder:  '#A8BACE',
    cancelText:   '#8BA3C0',
    checkBorder:  '#C0CFDF',
  };

  const activeCategories = userCategories
    .filter(c => c.source === 'app' || !c.isDeleted)
    .sort((a, b) => a.name.localeCompare(b.name));

  const displayedCategories = searchQuery.length >= 2
    ? activeCategories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeCategories;

  const toggleSelectMode = () => {
    setSelectMode(true);
    setSelectedIds([]);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDelete = (cat) => {
    Alert.alert(
      'Remove Category',
      `Remove "${cat.name}" from your category bank? This won't delete existing transactions.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => swipeRefs.current[cat.id]?.close() },
        { text: 'Remove', style: 'destructive', onPress: () => softDeleteCategory(cat.id, cat.source) },
      ],
    );
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    if (count === 0) return;
    Alert.alert(
      'Remove Categories',
      `Remove ${count} categor${count === 1 ? 'y' : 'ies'}? This won't delete existing transactions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            for (const id of selectedIds) {
              const cat = activeCategories.find(c => c.id === id);
              if (cat) await softDeleteCategory(cat.id, cat.source);
            }
            exitSelectMode();
          },
        },
      ],
    );
  };

  const handleCreate = async () => {
    const name = newCatName.trim();
    if (!name) return;
    const duplicate = activeCategories.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      Alert.alert('Duplicate Category', `"${name}" already exists in your category bank.`);
      return;
    }
    setCreating(true);
    await createUserCategory(name);
    setCreating(false);
    setNewCatName('');
    setShowCreateModal(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: t.bg }]}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.header, borderBottomColor: t.headerBorder }]}>
          {selectMode ? (
            <>
              <TouchableOpacity onPress={exitSelectMode}>
                <Text style={[styles.headerAction, { color: t.cancelText }]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.title, { color: t.title }]}>
                {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select'}
              </Text>
              <TouchableOpacity
                onPress={handleBulkDelete}
                disabled={selectedIds.length === 0}
                style={{ opacity: selectedIds.length === 0 ? 0.3 : 1 }}
              >
                <Text style={[styles.headerAction, { color: '#FF3B30' }]}>Delete</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View>
                <Text style={[styles.title, { color: t.title }]}>Category Bank</Text>
                <Text style={[styles.subtitle, { color: t.subtitle }]}>{activeCategories.length} categories</Text>
              </View>
              <View style={styles.headerBtns}>
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: t.inputBg, borderWidth: 1, borderColor: '#FF3B30' }]}
                  onPress={toggleSelectMode}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addBtn, { backgroundColor: t.addBtn }]}
                  onPress={() => setShowCreateModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Search bar */}
        <View style={[styles.searchRow, { backgroundColor: t.inputBg, borderColor: t.inputBorder }]}>
          <Ionicons name="search-outline" size={17} color={t.placeholder} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: t.inputText }]}
            placeholder="Search categories..."
            placeholderTextColor={t.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Category list */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {displayedCategories.map((cat, i) => {
            const isSelected = selectedIds.includes(cat.id);
            const borderBottom = i < displayedCategories.length - 1
              ? { borderBottomWidth: 1, borderBottomColor: t.rowBorder }
              : {};

            if (selectMode) {
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.row, { backgroundColor: t.row }, borderBottom]}
                  onPress={() => toggleSelect(cat.id)}
                  activeOpacity={0.6}
                >
                  <View style={[styles.iconCircle, { backgroundColor: cat.color + '22' }]}>
                    <Ionicons name={cat.icon || 'grid-outline'} size={18} color={cat.color} />
                  </View>
                  <Text style={[styles.catName, { color: t.name }]}>{cat.name}</Text>
                  {cat.source === 'app' && (
                    <View style={[styles.badge, { backgroundColor: t.badge }]}>
                      <Text style={[styles.badgeText, { color: t.badgeText }]}>Default</Text>
                    </View>
                  )}
                  <View style={[
                    styles.checkbox,
                    { borderColor: isSelected ? '#5C5CFF' : t.checkBorder, backgroundColor: isSelected ? '#5C5CFF' : 'transparent', marginLeft: 12 }
                  ]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <Swipeable
                key={cat.id}
                ref={ref => swipeRefs.current[cat.id] = ref}
                renderRightActions={() => (
                  <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(cat)}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                )}
                overshootRight={false}
              >
                <View style={[styles.row, { backgroundColor: t.row }, borderBottom]}>
                  <View style={[styles.iconCircle, { backgroundColor: cat.color + '22' }]}>
                    <Ionicons name={cat.icon || 'grid-outline'} size={18} color={cat.color} />
                  </View>
                  <Text style={[styles.catName, { color: t.name }]}>{cat.name}</Text>
                  {cat.source === 'app' && (
                    <View style={[styles.badge, { backgroundColor: t.badge }]}>
                      <Text style={[styles.badgeText, { color: t.badgeText }]}>Default</Text>
                    </View>
                  )}
                </View>
              </Swipeable>
            );
          })}

          {displayedCategories.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="pricetags-outline" size={40} color={t.icon} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: t.icon }]}>
                {searchQuery.length >= 2 ? 'No results found' : 'No categories yet'}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Create category modal */}
        <Modal
          transparent
          visible={showCreateModal}
          animationType="fade"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={[styles.modalSheet, { backgroundColor: t.modal, borderColor: t.modalBorder }]}>
              <Text style={[styles.modalTitle, { color: t.title }]}>New Category</Text>
              <TextInput
                style={[styles.input, { backgroundColor: t.inputBg, color: t.inputText, borderColor: t.inputBorder }]}
                placeholder="Category name"
                placeholderTextColor={t.placeholder}
                value={newCatName}
                onChangeText={setNewCatName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
                maxLength={40}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setShowCreateModal(false); setNewCatName(''); }}
                >
                  <Text style={[styles.cancelText, { color: t.cancelText }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: t.addBtn, opacity: newCatName.trim() ? 1 : 0.4 }]}
                  onPress={handleCreate}
                  disabled={!newCatName.trim() || creating}
                >
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title:          { fontSize: 22, fontWeight: '700' },
  subtitle:       { fontSize: 13, marginTop: 2 },
  headerBtns:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAction:   { fontSize: 16, fontWeight: '500' },
  iconBtn:        { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  addBtn:         { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  searchRow:      { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, marginBottom: 4, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 42 },
  searchInput:    { flex: 1, fontSize: 15 },
  row:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  iconCircle:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  catName:        { flex: 1, fontSize: 16, fontWeight: '400' },
  badge:          { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText:      { fontSize: 11, fontWeight: '600' },
  checkbox:       { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  deleteAction:   { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FF3B30', borderRadius: 10, justifyContent: 'center', alignItems: 'center', width: 64, marginRight: 8 },
  empty:          { alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText:      { fontSize: 16 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalSheet:     { width: '85%', borderRadius: 18, padding: 24, borderWidth: 1 },
  modalTitle:     { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  input:          { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, marginBottom: 20 },
  modalButtons:   { flexDirection: 'row', gap: 10 },
  cancelBtn:      { flex: 1, alignItems: 'center', paddingVertical: 12 },
  cancelText:     { fontSize: 16 },
  confirmBtn:     { flex: 1, borderRadius: 10, alignItems: 'center', paddingVertical: 12 },
  confirmText:    { fontSize: 16, fontWeight: '600', color: '#fff' },
});
