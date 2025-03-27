import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import inventoryStyles from '../styles/inventory';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;

const InventoryScreen = () => {
  const [foodItems, setFoodItems] = useState([
    { id: '1', name: 'Apples', quantity: 5, unit: 'pcs', expiryDate: '2023-12-15', calories: 52, category: 'Fruits' },
    { id: '2', name: 'Milk', quantity: 1, unit: 'liter', expiryDate: '2023-12-10', calories: 42, category: 'Dairy' },
    { id: '3', name: 'Chicken Breast', quantity: 500, unit: 'g', expiryDate: '2023-12-08', calories: 165, category: 'Meat' },
    { id: '4', name: 'Rice', quantity: 2, unit: 'kg', expiryDate: '2024-05-20', calories: 130, category: 'Grains' },
    { id: '5', name: 'Eggs', quantity: 12, unit: 'pcs', expiryDate: '2023-12-20', calories: 78, category: 'Dairy' },
    { id: '6', name: 'Bread', quantity: 1, unit: 'loaf', expiryDate: '2023-12-12', calories: 265, category: 'Bakery' },
    { id: '7', name: 'Cheese', quantity: 200, unit: 'g', expiryDate: '2023-12-25', calories: 402, category: 'Dairy' },
    { id: '8', name: 'Tomatoes', quantity: 6, unit: 'pcs', expiryDate: '2023-12-14', calories: 18, category: 'Vegetables' },
    { id: '9', name: 'Pasta', quantity: 500, unit: 'g', expiryDate: '2024-06-10', calories: 131, category: 'Grains' },
    { id: '10', name: 'Yogurt', quantity: 4, unit: 'cups', expiryDate: '2023-12-18', calories: 59, category: 'Dairy' },
    { id: '11', name: 'Bananas', quantity: 6, unit: 'pcs', expiryDate: '2023-12-13', calories: 89, category: 'Fruits' },
    { id: '12', name: 'Potatoes', quantity: 2, unit: 'kg', expiryDate: '2024-01-15', calories: 77, category: 'Vegetables' },
    { id: '13', name: 'Spinach', quantity: 300, unit: 'g', expiryDate: '2023-12-09', calories: 23, category: 'Vegetables' },
    { id: '14', name: 'Salmon', quantity: 500, unit: 'g', expiryDate: '2023-12-07', calories: 208, category: 'Seafood' },
    { id: '15', name: 'Olive Oil', quantity: 1, unit: 'bottle', expiryDate: '2024-06-20', calories: 884, category: 'Oils' },
  ]);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemExpiry, setNewItemExpiry] = useState('');
  const [newItemCalories, setNewItemCalories] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  
  const addItem = () => {
    if (newItemName.trim() === '' || newItemQuantity.trim() === '') {
      Alert.alert('Error', 'Please enter at least a name and quantity');
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: parseFloat(newItemQuantity),
      unit: newItemUnit || 'pcs',
      expiryDate: newItemExpiry || 'N/A',
      calories: newItemCalories ? parseInt(newItemCalories) : 0,
      category: newItemCategory || 'Uncategorized',
    };
    
    setFoodItems([...foodItems, newItem]);
    
    // Clear input fields
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemUnit('');
    setNewItemExpiry('');
    setNewItemCalories('');
    setNewItemCategory('');
  };
  
  const removeItem = (id) => {
    setFoodItems(foodItems.filter(item => item.id !== id));
  };
  
  const renderItem = (item) => (
    <View style={styles.itemContainer} key={item.id}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemInfo}>
          {item.quantity} {item.unit} • Category: {item.category}
        </Text>
        <Text style={styles.itemInfo}>
          Calories: {item.calories} kcal per serving
        </Text>
        <Text style={styles.itemInfo}>
          Expiration Date: {item.expiryDate}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => removeItem(item.id)}
        >
          <Text style={styles.actionButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Inventory</Text>
        <Text style={styles.subtitle}>Your digital refrigerator</Text>
      </View>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          alwaysBounceVertical={true}
        >
          <View style={styles.addItemContainer}>
            <Text style={styles.sectionTitle}>Add New Item</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Food name"
                value={newItemName}
                onChangeText={setNewItemName}
                placeholderTextColor="#555"
              />
              <TextInput
                style={[styles.input, styles.smallInput]}
                placeholder="Qty"
                value={newItemQuantity}
                onChangeText={setNewItemQuantity}
                keyboardType="numeric"
                placeholderTextColor="#555"
              />
              <TextInput
                style={[styles.input, styles.smallInput]}
                placeholder="Unit"
                value={newItemUnit}
                onChangeText={setNewItemUnit}
                placeholderTextColor="#555"
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.mediumInput]}
                placeholder="Category"
                value={newItemCategory}
                onChangeText={setNewItemCategory}
                placeholderTextColor="#555"
              />
              <TextInput
                style={[styles.input, styles.mediumInput]}
                placeholder="Calories"
                value={newItemCalories}
                onChangeText={setNewItemCalories}
                keyboardType="numeric"
                placeholderTextColor="#555"
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.mediumInput]}
                placeholder="Expiration Date (YYYY-MM-DD)"
                value={newItemExpiry}
                onChangeText={setNewItemExpiry}
                placeholderTextColor="#555"
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addItem}
              >
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>Current Inventory</Text>
            <View style={styles.list}>
              {foodItems.map(item => renderItem(item))}
            </View>
          </View>
          
          {/* Extra padding at the bottom to ensure scrolling works */}
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ...inventoryStyles,
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
});

export default InventoryScreen;
