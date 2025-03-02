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
import { LinearGradient } from 'expo-linear-gradient';

// Get screen dimensions
const { height, width } = Dimensions.get('window');

const CategorySelectorModal = ({ visible, onClose, onSelect, categories }) => {
  // Animation for sliding up
  const slideAnim = useRef(new Animated.Value(height)).current;
  
  // Local state to track when animation is completely finished
  const [modalVisible, setModalVisible] = useState(false);
  
  // Handle modal visibility and animation
  useEffect(() => {
    if (visible) {
      // Make modal visible first
      setModalVisible(true);
      
      // Then start slide-up animation
      slideAnim.setValue(height);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      // Start slide-down animation
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start(({ finished }) => {
        // Only hide modal after animation is complete
        if (finished) {
          setModalVisible(false);
        }
      });
    }
  }, [visible, slideAnim]);

  // Early return if modal shouldn't be visible
  if (!modalVisible && !visible) return null;

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="none"
      onRequestClose={() => {
        // Handle back button press on Android
        onClose();
      }}
      supportedOrientations={['portrait']}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.dismissArea} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={['#21233f', '#252545', '#232343']}
            style={styles.modalGradient}
          >
            <View style={styles.modalHeader}>
              <View style={styles.downArrow}>
                <Text style={styles.arrowText}>↓</Text>
              </View>
            </View>
            
            <ScrollView 
              style={styles.categoryList}
              showsVerticalScrollIndicator={false}
            >
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryItem}
                  onPress={() => {
                    // First select the category
                    onSelect(category);
                    // Then close the modal
                    onClose();
                  }}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  modalContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: height * 0.6,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#1D1D1D',
  },
  downArrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 24,
    color: 'white',
    opacity: 0.5,
  },
  categoryList: {
    paddingHorizontal: 24,
    paddingBottom: 50, // Extra padding at bottom for safe area
    backgroundColor: '#1D1D1D'
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    marginBottom: 5,
    backgroundColor: '#1D1D1D',
    borderTopWidth: 1,
    borderColor: "gray"
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  categoryName: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default CategorySelectorModal;