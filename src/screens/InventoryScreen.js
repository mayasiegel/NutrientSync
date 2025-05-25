import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable, FlatList, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FoodSearch from '../components/FoodSearch';

const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Other'];
const CATEGORY_ICONS = {
  All: '📦',
  Fruits: '🍎',
  Vegetables: '🥬',
  Dairy: '🥛',
  Meat: '🍗',
  Other: '🍽️',
};

const initialFoods = [
  {
    id: '1',
    name: 'Apples',
    category: 'Fruits',
    quantity: 5,
    expiration: '2023-12-15',
    calories: 95,
  },
  {
    id: '2',
    name: 'Milk',
    category: 'Dairy',
    quantity: 1,
    expiration: '2023-12-10',
    calories: 150,
  },
  {
    id: '3',
    name: 'Chicken Breast',
    category: 'Meat',
    quantity: 3,
    expiration: '2023-12-12',
    calories: 200,
  },
];

function formatDate(dateStr) {
  // Accepts YYYY-MM-DD, returns MM/DD/YYYY
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${month}/${day}/${year}`;
}

export default function InventoryScreen() {
  const [foods, setFoods] = useState(initialFoods);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: 'Fruits',
    quantity: '',
    expiration: '',
    calories: '',
  });
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'add'
  const [showExpModal, setShowExpModal] = useState(false);
  const [pendingUsdaFood, setPendingUsdaFood] = useState(null);
  const [expInput, setExpInput] = useState('');
  const expInputRef = useRef();

  const openAddModal = () => {
    setEditId(null);
    setForm({ name: '', category: 'Fruits', quantity: '', expiration: '', calories: '' });
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      expiration: item.expiration,
      calories: String(item.calories),
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.name || !form.category || !form.quantity || !form.expiration || !form.calories) return;
    if (editId) {
      setFoods(foods.map(f => f.id === editId ? { ...f, ...form, quantity: Number(form.quantity), calories: Number(form.calories) } : f));
    } else {
      setFoods([
        ...foods,
        {
          ...form,
          id: Date.now().toString(),
          quantity: Number(form.quantity),
          calories: Number(form.calories),
        },
      ]);
    }
    setModalVisible(false);
  };

  // Add handler for FoodSearch
  const handleAddFoodFromSearch = (item) => {
    if (foods.some(f => f.fdcId === item.fdcId)) {
      setConfirmation('Food already in inventory!');
      setTimeout(() => setConfirmation(''), 2000);
      return;
    }
    setPendingUsdaFood(item);
    setShowExpModal(true);
    setExpInput('');
    setTimeout(() => expInputRef.current && expInputRef.current.focus(), 300);
  };

  // Confirm add USDA food (with or without expiration)
  const confirmAddUsdaFood = (expiration) => {
    const item = pendingUsdaFood;
    const nutrients = item.foodNutrients || [];
    setFoods([
      ...foods,
      {
        id: Date.now().toString(),
        fdcId: item.fdcId,
        name: item.description,
        category: 'Other',
        quantity: 1,
        expiration: expiration || '',
        calories: nutrients.find(n => n.nutrientName === 'Energy')?.value || '',
        protein: nutrients.find(n => n.nutrientName === 'Protein')?.value || '',
        carbs: nutrients.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || '',
        fat: nutrients.find(n => n.nutrientName === 'Total lipid (fat)')?.value || '',
        fiber: nutrients.find(n => n.nutrientName === 'Fiber, total dietary')?.value || '',
      },
    ]);
    setShowExpModal(false);
    setPendingUsdaFood(null);
    setConfirmation('Food added to inventory!');
    setTimeout(() => setConfirmation(''), 2000);
  };

  // Filtered foods for inventory
  const filteredFoods = foods.filter(f =>
    (categoryFilter === 'All' || f.category === categoryFilter) &&
    (f.name.toLowerCase().includes(search.toLowerCase()) || f.category.toLowerCase().includes(search.toLowerCase()))
  );

  // Render each inventory item
  const renderInventoryItem = ({ item }) => (
    <View style={styles.foodCard}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodCategory}>{item.category}</Text>
        </View>
        <View style={styles.foodQty}><Text style={styles.foodQtyText}>{item.quantity}</Text></View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Text style={styles.expiryText}>Expires on <Text style={styles.expiryDate}>{formatDate(item.expiration)}</Text></Text>
        <TouchableOpacity onPress={() => openEditModal(item)}><Text style={styles.editBtn}>Edit</Text></TouchableOpacity>
      </View>
      <View style={{ marginTop: 8 }}>
        <Text style={styles.caloriesText}>Calories: {item.calories}</Text>
      </View>
    </View>
  );

  // Tab bar
  const tabBar = (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'inventory' && styles.activeTab]}
        onPress={() => setActiveTab('inventory')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabText, activeTab === 'inventory' && styles.activeTabText]}>My Inventory</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'add' && styles.activeTab]}
        onPress={() => setActiveTab('add')}
        activeOpacity={0.8}
      >
        <Text style={[styles.tabText, activeTab === 'add' && styles.activeTabText]}>Add Food</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.fridgeHeader}>Your Digital Refrigerator</Text>
      {tabBar}
      {activeTab === 'inventory' ? (
        <View style={{ flex: 1, marginTop: 0, marginBottom: 0 }}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search your inventory..."
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8, marginLeft: 8, marginBottom: 12 }}>
            {['All', ...CATEGORIES].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryButton, categoryFilter === cat && styles.categoryButtonActive]}
                onPress={() => setCategoryFilter(cat)}
              >
                <Text style={{ fontSize: 18 }}>{CATEGORY_ICONS[cat] || '🍽️'}</Text>
                <Text style={[styles.categoryButtonText, categoryFilter === cat && styles.categoryButtonTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <FlatList
            data={filteredFoods}
            renderItem={renderInventoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No items in your inventory.</Text>}
          />
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+ Add Custom Item</Text>
          </TouchableOpacity>
          {confirmation ? <Text style={styles.confirmation}>{confirmation}</Text> : null}
        </View>
      ) : (
        <View style={styles.addFoodTabContainer}>
          <FoodSearch onAdd={handleAddFoodFromSearch} />
          {confirmation ? <Text style={styles.confirmation}>{confirmation}</Text> : null}
        </View>
      )}
      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editId ? 'Edit Item' : 'Add Item'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={form.name}
              onChangeText={v => setForm({ ...form, name: v })}
            />
            <View style={styles.pickerRow}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8, marginLeft: 8, marginBottom: 12 }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryButton, form.category === cat && styles.categoryButtonActive]}
                    onPress={() => setForm({ ...form, category: cat })}
                  >
                    <Text style={{ fontSize: 18 }}>{CATEGORY_ICONS[cat] || '🍽️'}</Text>
                    <Text style={[styles.categoryButtonText, form.category === cat && styles.categoryButtonTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              keyboardType="numeric"
              value={form.quantity}
              onChangeText={v => setForm({ ...form, quantity: v.replace(/[^0-9]/g, '') })}
            />
            <TextInput
              style={styles.input}
              placeholder="Expiration Date (YYYY-MM-DD)"
              value={form.expiration}
              onChangeText={v => setForm({ ...form, expiration: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="Calories"
              keyboardType="numeric"
              value={form.calories}
              onChangeText={v => setForm({ ...form, calories: v.replace(/[^0-9]/g, '') })}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      {/* Expiration Date Modal for USDA food */}
      <Modal visible={showExpModal} animationType="slide" transparent onRequestClose={() => setShowExpModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.expModalContent}>
            <Text style={styles.modalTitle}>Expiration Date (Optional)</Text>
            <Text style={{ color: '#555', marginBottom: 12, textAlign: 'center' }}>
              Enter an expiration date for this food (YYYY-MM-DD), or skip to add without one.
            </Text>
            <TextInput
              ref={expInputRef}
              style={styles.input}
              placeholder="YYYY-MM-DD (optional)"
              value={expInput}
              onChangeText={setExpInput}
              autoFocus
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <Pressable style={styles.cancelBtn} onPress={() => { setShowExpModal(false); setPendingUsdaFood(null); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={() => confirmAddUsdaFood(expInput)}>
                <Text style={styles.saveBtnText}>Add</Text>
              </Pressable>
              <Pressable style={styles.skipBtn} onPress={() => confirmAddUsdaFood('')}>
                <Text style={styles.skipBtnText}>Skip</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  titleSection: { alignItems: 'flex-start', marginTop: 32, marginBottom: 8, marginLeft: 16 },
  appTitle: { fontSize: 32, fontWeight: 'bold', color: '#222' },
  subtitle: { fontSize: 18, color: '#555', marginTop: 4 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  actionButton: { backgroundColor: '#4A90E2', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 20, marginHorizontal: 4 },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  searchBar: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16, marginHorizontal: 16, marginBottom: 8, marginTop: 4 },
  categoryButton: { width: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: 12, paddingVertical: 8, marginRight: 8, flexDirection: 'row', alignSelf: 'flex-start' },
  categoryButtonActive: { backgroundColor: '#4A90E2' },
  categoryButtonText: { fontSize: 16, color: '#222', marginLeft: 6, fontWeight: 'bold' },
  categoryButtonTextActive: { color: '#fff' },
  foodCard: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  foodName: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  foodCategory: { fontSize: 16, color: '#888', marginTop: 2 },
  foodQty: { backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  foodQtyText: { fontSize: 18, color: '#22b573', fontWeight: 'bold' },
  expiryText: { fontSize: 16, color: '#222' },
  expiryDate: { color: '#e74c3c', fontWeight: 'bold' },
  editBtn: { color: '#22b573', fontWeight: 'bold', fontSize: 16 },
  caloriesText: { fontSize: 15, color: '#555' },
  addButton: { position: 'absolute', right: 24, bottom: 32, backgroundColor: '#22b573', borderRadius: 24, paddingVertical: 10, paddingHorizontal: 20, elevation: 3 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '90%', alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 12, width: '100%', backgroundColor: '#fafafa' },
  pickerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cancelBtn: { backgroundColor: '#e74c3c', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginRight: 8 },
  cancelBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  saveBtn: { backgroundColor: '#22b573', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginLeft: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  confirmation: { color: '#22b573', fontWeight: 'bold', fontSize: 18, marginTop: 16, marginBottom: 16, textAlign: 'center' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginLeft: 16, marginTop: 16, marginBottom: 8 },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 17,
    color: '#333',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#fff',
  },
  addFoodTabContainer: {
    flex: 1,
    paddingHorizontal: 8,
    backgroundColor: '#f7f7f7',
  },
  expModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  skipBtn: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginLeft: 8,
  },
  skipBtnText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  fridgeHeader: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 24, marginBottom: 8, color: '#222' },
}); 