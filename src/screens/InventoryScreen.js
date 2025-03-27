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
import { useInventory } from '../context/InventoryContext';
import inventoryStyles from '../styles/inventory';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;

const InventoryScreen = ({ navigation }) => {
  const { inventory, addInventoryItem, removeInventoryItem } = useInventory();
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
    
    addInventoryItem(newItem);
    
    // Clear input fields
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemUnit('');
    setNewItemExpiry('');
    setNewItemCalories('');
    setNewItemCategory('');
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
          onPress={() => removeInventoryItem(item.id)}
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.buttonText}>Scan Food</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('CustomFood')}
        >
          <Text style={styles.buttonText}>Custom Food</Text>
        </TouchableOpacity>
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
              {inventory.map(item => renderItem(item))}
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
});

export default InventoryScreen;
