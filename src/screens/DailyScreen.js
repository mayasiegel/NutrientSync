import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, Dimensions, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { updateUserStreak } from '../services/streakService';

// This will be replaced with real inventory data from Supabase

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
  const [log, setLog] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [pastLogs, setPastLogs] = useState(examplePastLogs);
  const [pastModal, setPastModal] = useState(false);
  const [foodInput, setFoodInput] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const selectInputRef = useRef(null);
  const navigation = useNavigation();

  // Fetch inventory and daily log data
  useEffect(() => {
    fetchInventory();
    fetchDailyLog();
  }, []);

  // Refetch data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchInventory();
      fetchDailyLog();
    }, [])
  );

  async function fetchInventory() {
    try {
      setInventoryLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        console.log('No user session found');
        return;
      }

      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', session.user.id)
        .gt('quantity', 0) // Only show items with quantity > 0
        .order('name');

      if (error) {
        console.error('Error fetching inventory:', error);
        Alert.alert('Error', 'Failed to load inventory');
      } else {
        setInventory(data || []);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setInventoryLoading(false);
    }
  }

  async function fetchDailyLog() {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        console.log('No user session found');
        return;
      }

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('daily_log')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('log_date', today)
        .order('consumed_at', { ascending: false });

      if (error) {
        console.error('Error fetching daily log:', error);
        Alert.alert('Error', 'Failed to load today\'s log');
      } else {
        // Transform the data to match the expected format
        const transformedLog = (data || []).map(item => ({
          id: item.id,
          name: item.food_name,
          quantity: item.quantity,
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          unit: item.unit,
          time: new Date(item.consumed_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
        }));
        setLog(transformedLog);
      }
    } catch (error) {
      console.error('Error fetching daily log:', error);
      Alert.alert('Error', 'Failed to load today\'s log');
    } finally {
      setLoading(false);
    }
  }

  // Calculate total calories and macros for today
  const totalCalories = log.reduce((sum, item) => sum + item.calories * item.quantity, 0);
  const totalProtein = log.reduce((sum, item) => sum + (item.protein || 0) * item.quantity, 0);
  const totalCarbs = log.reduce((sum, item) => sum + (item.carbs || 0) * item.quantity, 0);
  const totalFat = log.reduce((sum, item) => sum + (item.fat || 0) * item.quantity, 0);

  // Filter inventory foods by input
  const filteredFoods = inventory.filter(f =>
    f.name.toLowerCase().includes(foodInput.toLowerCase())
  );

    // Add food to today's log and remove from inventory
  const handleAdd = async () => {
    const food = inventory.find(f => f.name.toLowerCase() === foodInput.toLowerCase());
    if (!food || !quantity || isNaN(Number(quantity))) return;

    const quantityToAdd = Number(quantity);
    const availableQuantity = food.quantity;

    if (quantityToAdd > availableQuantity) {
      Alert.alert('Not Enough', `You only have ${availableQuantity} ${food.unit}(s) of ${food.name}`);
      return;
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        Alert.alert('Error', 'Please log in to add foods');
        return;
      }

      // Add to daily log
      const { error: logError } = await supabase
        .from('daily_log')
        .insert({
          user_id: session.user.id,
          food_name: food.name,
          quantity: quantityToAdd,
          unit: food.unit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          iron: food.iron,
          calcium: food.calcium,
          vitamin_c: food.vitamin_c,
          inventory_item_id: food.id,
          consumed_at: new Date().toISOString(),
          log_date: new Date().toISOString().split('T')[0]
        });

      if (logError) {
        console.error('Error adding to daily log:', logError);
        Alert.alert('Error', 'Failed to add food to daily log');
        return;
      }

      // Update inventory quantity
      const newQuantity = availableQuantity - quantityToAdd;
      if (newQuantity <= 0) {
        // Remove item from inventory if quantity becomes 0
        const { error: deleteError } = await supabase
          .from('inventory')
          .delete()
          .eq('id', food.id);

        if (deleteError) {
          console.error('Error removing from inventory:', deleteError);
        }
      } else {
        // Update quantity in inventory
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ quantity: newQuantity })
          .eq('id', food.id);

        if (updateError) {
          console.error('Error updating inventory:', updateError);
        }
      }

      // Refresh data
      await fetchInventory();
      await fetchDailyLog();

      setFoodInput('');
      setSelectedFoodId('');
      setQuantity('');

      await updateUserStreak(session.user.id);

    } catch (error) {
      console.error('Error adding food:', error);
      Alert.alert('Error', 'Failed to add food');
    }
  };

  // Delete food from today's log
  const handleDelete = async (logItem) => {
    try {
      const { error } = await supabase
        .from('daily_log')
        .delete()
        .eq('id', logItem.id);

      if (error) {
        console.error('Error deleting from daily log:', error);
        Alert.alert('Error', 'Failed to delete food from log');
        return;
      }

      // Refresh the daily log
      await fetchDailyLog();

    } catch (error) {
      console.error('Error deleting food:', error);
      Alert.alert('Error', 'Failed to delete food');
    }
  };

  // Format date as MM/DD/YYYY
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${month}/${day}/${year}`;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your daily log...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
        <View style={styles.titleSection}>
          <Text style={styles.appTitle}>Daily Food Log</Text>
          <Text style={styles.subtitle}>Today's Totals:</Text>
          <View style={styles.totalsContainer}>
            <Text style={styles.totalText}>Calories: <Text style={styles.caloriesTotal}>{totalCalories}</Text></Text>
            <Text style={styles.totalText}>Protein: <Text style={styles.proteinTotal}>{totalProtein.toFixed(1)}g</Text></Text>
            <Text style={styles.totalText}>Carbs: <Text style={styles.carbsTotal}>{totalCarbs.toFixed(1)}g</Text></Text>
            <Text style={styles.totalText}>Fat: <Text style={styles.fatTotal}>{totalFat.toFixed(1)}g</Text></Text>
          </View>
        </View>
        {inventory.length === 0 && !inventoryLoading ? (
          <View style={styles.emptyInventoryContainer}>
            <Text style={styles.emptyInventoryText}>Your inventory is empty!</Text>
            <Text style={styles.emptyInventorySubtext}>Add some foods to your inventory first, then you can log them here.</Text>
            <TouchableOpacity 
              style={styles.goToInventoryBtn}
              onPress={() => navigation.navigate('Inventory')}
            >
              <Text style={styles.goToInventoryBtnText}>Go to Inventory</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <View style={styles.addBox}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={styles.selectInput}
                  placeholder={inventory.length === 0 ? "No foods in inventory - add some first!" : "Select food from inventory"}
                  value={foodInput}
                  onChangeText={text => {
                    setFoodInput(text);
                    setDropdownVisible(true);
                  }}
                  onFocus={() => setDropdownVisible(true)}
                  autoCorrect={false}
                  autoCapitalize="none"
                  editable={inventory.length > 0}
                />
                {dropdownVisible && (
                  <View style={[styles.dropdownOverlay, { zIndex: 10, position: 'absolute', top: 48, left: 0, right: 0 }]}> 
                    <View style={styles.dropdown}>
                      {inventoryLoading ? (
                        <View style={styles.dropdownItem}>
                          <ActivityIndicator size="small" color="#007AFF" />
                          <Text style={styles.dropdownText}>Loading inventory...</Text>
                        </View>
                      ) : filteredFoods.length > 0 ? (
                        filteredFoods.map(food => (
                          <TouchableOpacity
                            key={food.id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setFoodInput(food.name);
                              setSelectedFoodId(food.id);
                              setDropdownVisible(false);
                            }}
                          >
                            <Text style={styles.dropdownText}>{food.name}</Text>
                            <Text style={styles.dropdownQuantity}>Qty: {food.quantity} {food.unit}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.dropdownItem}>
                          <Text style={styles.dropdownText}>No foods found in inventory</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
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
        )}
        {/* Today's log */}
        {log.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No foods logged today</Text>
            <Text style={styles.emptySubtext}>Add foods from your inventory to start tracking</Text>
          </View>
        ) : (
          log.map((item) => (
            <View key={item.id} style={styles.foodCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.foodName}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Text style={styles.deleteBtn}>Delete</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.foodDetails}>
                Quantity: {item.quantity} {item.unit} • {item.calories * item.quantity} cal total ({item.calories} cal/{item.unit}) • {item.time}
              </Text>
              <Text style={styles.nutrientDetails}>
                Protein: {(item.protein * item.quantity).toFixed(1)}g • Carbs: {(item.carbs * item.quantity).toFixed(1)}g • Fat: {(item.fat * item.quantity).toFixed(1)}g
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      {/* Past Logs Modal */}
      <Modal visible={pastModal} animationType="slide" transparent onRequestClose={() => setPastModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Past 7 Days Food Logs</Text>
            <ScrollView style={{ width: '100%' }}>
              {pastLogs.map((log, idx) => (
                <View key={log.date} style={styles.pastLogCard}>
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
  titleSection: { alignItems: 'flex-start', marginTop: 36, marginBottom: 12, marginLeft: 20 },
  appTitle: { fontSize: 32, fontWeight: 'bold', color: '#222' },
  subtitle: { fontSize: 18, color: '#555', marginTop: 4 },
  totalsContainer: { marginTop: 8 },
  totalText: { fontSize: 16, color: '#555', marginBottom: 2 },
  caloriesTotal: { color: '#22b573', fontWeight: 'bold', fontSize: 18 },
  proteinTotal: { color: '#e74c3c', fontWeight: 'bold', fontSize: 18 },
  carbsTotal: { color: '#f39c12', fontWeight: 'bold', fontSize: 18 },
  fatTotal: { color: '#9b59b6', fontWeight: 'bold', fontSize: 18 },
  addBox: { backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 20, marginBottom: 24, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  selectInput: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 0 },
  qtyInput: { backgroundColor: '#f0f0f0', borderRadius: 10, padding: 14, width: 70, marginRight: 10, fontSize: 16 },
  addBtn: { backgroundColor: '#2196f3', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, marginRight: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  pastBtn: { backgroundColor: '#eee', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20 },
  pastBtnText: { color: '#205081', fontWeight: 'bold', fontSize: 16 },
  foodCard: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 20, marginBottom: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  foodName: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  foodDetails: { fontSize: 15, color: '#555', marginTop: 4 },
  nutrientDetails: { fontSize: 14, color: '#666', marginTop: 4, fontStyle: 'italic' },
  deleteBtn: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 32, paddingHorizontal: 20 },
  emptyText: { textAlign: 'center', color: '#888', fontSize: 18, fontWeight: '500' },
  emptySubtext: { textAlign: 'center', color: '#999', fontSize: 14, marginTop: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '90%', alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 16 },
  pastLogCard: { backgroundColor: '#f7fafd', borderRadius: 12, padding: 16, marginBottom: 14 },
  pastDate: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  pastCalories: { fontSize: 16, color: '#22b573', fontWeight: 'bold' },
  pastItems: { fontSize: 15, color: '#888', marginBottom: 8 },
  closeBtn: { backgroundColor: '#2196f3', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28, marginTop: 16 },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
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
    borderRadius: 10,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 2,
  },
  dropdownItem: { padding: 12 },
  dropdownText: { fontSize: 16, color: '#222' },
  dropdownQuantity: { fontSize: 14, color: '#666', marginTop: 2 },
  emptyInventoryContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 18, 
    marginHorizontal: 20, 
    marginBottom: 24, 
    padding: 24, 
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  emptyInventoryText: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  emptyInventorySubtext: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 16 },
  goToInventoryBtn: { 
    backgroundColor: '#2196f3', 
    borderRadius: 12, 
    paddingVertical: 12, 
    paddingHorizontal: 24 
  },
  goToInventoryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 