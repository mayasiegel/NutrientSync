import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Example inventory foods (in a real app, this would come from context or props)
const INVENTORY = [
  { id: '1', name: 'Oatmeal', calories: 150, unit: 'bowl' },
  { id: '2', name: 'Apple', calories: 95, unit: 'piece' },
  { id: '3', name: 'Chicken Salad', calories: 350, unit: 'bowl' },
];

const examplePastLogs = [
  {
    date: '2025-05-19',
    items: [
      { name: 'Oatmeal', quantity: 1, calories: 150 },
      { name: 'Apple', quantity: 1, calories: 95 },
      { name: 'Chicken Salad', quantity: 1, calories: 350 },
    ],
  },
  {
    date: '2025-05-18',
    items: [
      { name: 'Oatmeal', quantity: 1, calories: 150 },
      { name: 'Apple', quantity: 1, calories: 95 },
      { name: 'Chicken Salad', quantity: 1, calories: 42 },
    ],
  },
  {
    date: '2025-05-17',
    items: [
      { name: 'Oatmeal', quantity: 1, calories: 150 },
      { name: 'Apple', quantity: 1, calories: 95 },
      { name: 'Chicken Salad', quantity: 1, calories: 320 },
    ],
  },
];

function getCurrentTime() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

export default function DailyScreen() {
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [log, setLog] = useState([
    {
      name: 'Oatmeal',
      quantity: 1,
      calories: 150,
      unit: 'bowl',
      time: '08:00 AM',
    },
  ]);
  const [pastLogs, setPastLogs] = useState(examplePastLogs);
  const [pastModal, setPastModal] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const selectInputRef = useRef(null);

  // Calculate total calories for today
  const totalCalories = log.reduce((sum, item) => sum + item.calories * item.quantity, 0);

  // Add food to today's log
  const handleAdd = () => {
    const food = INVENTORY.find(f => f.id === selectedFoodId);
    if (!food || !quantity || isNaN(Number(quantity))) return;
    setLog([
      ...log,
      {
        name: food.name,
        quantity: Number(quantity),
        calories: food.calories,
        unit: food.unit,
        time: getCurrentTime(),
      },
    ]);
    setSelectedFoodId('');
    setQuantity('');
  };

  // Delete food from today's log
  const handleDelete = idx => {
    setLog(log.filter((_, i) => i !== idx));
  };

  // Format date as MM/DD/YYYY
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${month}/${day}/${year}`;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <View style={styles.titleSection}>
          <Text style={styles.appTitle}>Daily Food Log</Text>
          <Text style={styles.subtitle}>Total Calories Today: <Text style={styles.caloriesTotal}>{totalCalories}</Text></Text>
        </View>
        <View style={styles.addBox}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                ref={selectInputRef}
                style={styles.selectInput}
                onPress={() => setDropdownVisible(!dropdownVisible)}
                activeOpacity={0.7}
              >
                <Text style={{ color: selectedFoodId ? '#222' : '#888' }}>
                  {selectedFoodId ? INVENTORY.find(f => f.id === selectedFoodId)?.name : 'Select food from inventory'}
                </Text>
              </TouchableOpacity>
              {dropdownVisible && (
                <View style={styles.dropdownOverlay}>
                  <View style={styles.dropdown}>
                    {INVENTORY.map(food => (
                      <TouchableOpacity
                        key={food.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedFoodId(food.id);
                          setDropdownVisible(false);
                        }}
                      >
                        <Text style={styles.dropdownText}>{food.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
          <View style={[styles.row, { marginTop: 8 }]}>
            <TextInput
              style={styles.qtyInput}
              placeholder="Qty"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pastBtn} onPress={() => setPastModal(true)}>
              <Text style={styles.pastBtnText}>View Past Logs</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Today's log */}
        {log.map((item, idx) => (
          <View key={idx} style={styles.foodCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.foodName}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleDelete(idx)}>
                <Text style={styles.deleteBtn}>Delete</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.foodDetails}>
              Quantity: {item.quantity} {item.unit} • {item.calories * item.quantity} cal total ({item.calories} cal/{item.unit}) • {item.time}
            </Text>
          </View>
        ))}
      </ScrollView>
      {/* Past Logs Modal */}
      <Modal visible={pastModal} animationType="slide" transparent onRequestClose={() => setPastModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Past 7 Days Food Logs</Text>
            <ScrollView style={{ width: '100%' }}>
              {pastLogs.map((log, idx) => (
                <View key={log.date} style={{ marginBottom: 18 }}>
                  <Text style={styles.pastDate}>{formatDate(log.date)}</Text>
                  <Text style={styles.pastCalories}>Total Calories: {log.items.reduce((sum, i) => sum + i.calories * i.quantity, 0)}</Text>
                  <Text style={styles.pastItems}>{log.items.length} items</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setPastModal(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  titleSection: { alignItems: 'flex-start', marginTop: 32, marginBottom: 8, marginLeft: 16 },
  appTitle: { fontSize: 32, fontWeight: 'bold', color: '#222' },
  subtitle: { fontSize: 18, color: '#555', marginTop: 4 },
  caloriesTotal: { color: '#22b573', fontWeight: 'bold', fontSize: 20 },
  addBox: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 20, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  selectInput: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 12, marginBottom: 8 },
  qtyInput: { backgroundColor: '#f0f0f0', borderRadius: 8, padding: 12, width: 60, marginRight: 8, fontSize: 16 },
  addBtn: { backgroundColor: '#22b573', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 18, marginRight: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  pastBtn: { backgroundColor: '#ccc', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 18 },
  pastBtnText: { color: '#444', fontWeight: 'bold', fontSize: 16 },
  foodCard: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  foodName: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  foodDetails: { fontSize: 16, color: '#444', marginTop: 4 },
  deleteBtn: { color: '#e74c3c', fontWeight: 'bold', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '90%', alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 16 },
  pastDate: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  pastCalories: { fontSize: 16, color: '#444' },
  pastItems: { fontSize: 15, color: '#888', marginBottom: 8 },
  closeBtn: { backgroundColor: '#ccc', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 16 },
  closeBtnText: { color: '#444', fontWeight: 'bold', fontSize: 18 },
  dropdownOverlay: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 2,
  },
  dropdownItem: { padding: 12 },
  dropdownText: { fontSize: 16, color: '#222' },
}); 