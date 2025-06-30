import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FoodSearch from '../components/FoodSearch';

export default function AddFoodScreen({ navigation, route }) {
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customQuantity, setCustomQuantity] = useState('');
  const [customExpiry, setCustomExpiry] = useState('');
  const [customCalories, setCustomCalories] = useState('');

  const handleCustomSave = () => {
    // You can wire this up to your backend or inventory logic
    setCustomModalVisible(false);
    setCustomName('');
    setCustomCategory('');
    setCustomQuantity('');
    setCustomExpiry('');
    setCustomCalories('');
    // Optionally, show a confirmation or add to inventory
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Food</Text>
        <TouchableOpacity onPress={() => setCustomModalVisible(true)} style={styles.customBtn}>
          <Text style={styles.customBtnText}>Custom Add</Text>
        </TouchableOpacity>
      </View>
      {/* Add vertical space below header */}
      <View style={{ height: 12 }} />
      {/* USDA Food Search */}
      <FoodSearch onAdd={() => navigation.goBack()} />

      {/* Custom Add Modal */}
      <Modal visible={customModalVisible} animationType="slide" transparent onRequestClose={() => setCustomModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Item</Text>
            <ScrollView>
              <TextInput style={styles.input} placeholder="Name" value={customName} onChangeText={setCustomName} />
              <Text style={styles.label}>Category:</Text>
              <View style={styles.categoryRow}>
                <TouchableOpacity onPress={() => setCustomCategory('Fruits')}><Text style={styles.catIcon}>🍎</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setCustomCategory('Vegetables')}><Text style={styles.catIcon}>🥬</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setCustomCategory('Dairy')}><Text style={styles.catIcon}>🥛</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setCustomCategory('Meat')}><Text style={styles.catIcon}>🍗</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setCustomCategory('Other')}><Text style={styles.catIcon}>🍽️</Text></TouchableOpacity>
              </View>
              <TextInput style={styles.input} placeholder="Quantity" value={customQuantity} onChangeText={setCustomQuantity} />
              <TextInput style={styles.input} placeholder="Expiration Date (YYYY-MM-DD)" value={customExpiry} onChangeText={setCustomExpiry} />
              <TextInput style={styles.input} placeholder="Calories" value={customCalories} onChangeText={setCustomCalories} />
            </ScrollView>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCustomModalVisible(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCustomSave}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafd' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  backBtn: { padding: 4, marginRight: 8 },
  backBtnText: { fontSize: 24, color: '#2196f3', fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#222', flex: 1, textAlign: 'center' },
  customBtn: { backgroundColor: '#2196f3', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  customBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 18, padding: 24, width: '90%', maxWidth: 400, alignItems: 'stretch' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 12, textAlign: 'center' },
  input: { backgroundColor: '#f0f2f5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: '#222', marginBottom: 12 },
  label: { fontSize: 15, color: '#222', marginBottom: 4 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  catIcon: { fontSize: 28, marginHorizontal: 6 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  cancelBtn: { backgroundColor: '#e74c3c', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  saveBtn: { backgroundColor: '#27ae60', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 