import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useInventory } from '../context/InventoryContext';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;

const DailyFoodLogScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [totalCalories, setTotalCalories] = useState(0);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const navigation = useNavigation();
  const { inventory, updateInventoryItemQuantity } = useInventory();

  const addFoodItem = () => {
    if (!selectedFood || quantity.trim() === '') {
      Alert.alert('Error', 'Please select a food item and enter quantity');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    // Check if there's enough quantity in inventory
    if (quantityNum > selectedFood.quantity) {
      Alert.alert('Error', `Not enough ${selectedFood.name} in inventory. Available: ${selectedFood.quantity} ${selectedFood.unit}`);
      return;
    }

    const totalItemCalories = Math.round(selectedFood.calories * quantityNum);
    const currentDate = new Date().toLocaleDateString();
    const newItem = {
      id: Date.now().toString(),
      name: selectedFood.name,
      quantity: quantityNum,
      unit: selectedFood.unit,
      calories: totalItemCalories,
      caloriesPerUnit: selectedFood.calories,
      date: currentDate,
      time: new Date().toLocaleTimeString(),
      inventoryId: selectedFood.id, // Store the inventory item ID for reference
    };

    // Update inventory quantity
    const remainingQuantity = selectedFood.quantity - quantityNum;
    updateInventoryItemQuantity(selectedFood.id, remainingQuantity);

    setFoodItems([...foodItems, newItem]);
    setTotalCalories(totalCalories + totalItemCalories);
    setSelectedFood(null);
    setQuantity('');
  };

  const deleteFoodItem = (id, itemCalories) => {
    const itemToDelete = foodItems.find(item => item.id === id);
    if (itemToDelete) {
      // Find the corresponding inventory item
      const inventoryItem = inventory.find(item => item.id === itemToDelete.inventoryId);
      if (inventoryItem) {
        // Return the quantity back to inventory
        const newQuantity = inventoryItem.quantity + itemToDelete.quantity;
        updateInventoryItemQuantity(itemToDelete.inventoryId, newQuantity);
      }
    }
    
    setFoodItems(foodItems.filter(item => item.id !== id));
    setTotalCalories(totalCalories - itemCalories);
  };

  const renderFoodItem = ({ item }) => (
    <View style={styles.foodItem}>
      <View style={styles.foodItemContent}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodDetails}>
          Quantity: {item.quantity} {item.unit} • {item.calories} cal total
          ({item.caloriesPerUnit} cal/{item.unit}) • {item.time}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteFoodItem(item.id, item.calories)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFoodPicker = () => (
    <Modal
      visible={showFoodPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFoodPicker(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Food from Inventory</Text>
          <View style={styles.foodListScrollWrapper}>
            <ScrollView style={styles.foodList} showsVerticalScrollIndicator={true}>
              {inventory
                .filter(item => item.quantity > 0)
                .map((item, idx, arr) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.foodOptionCard,
                      idx === 0 ? { marginTop: 2 } : {},
                      idx === arr.length - 1 ? { marginBottom: 2 } : {},
                    ]}
                    onPress={() => {
                      setSelectedFood(item);
                      setShowFoodPicker(false);
                    }}
                  >
                    <Text style={styles.foodOptionName}>{item.name}</Text>
                    <Text style={styles.foodOptionDetails}>
                      Available: {item.quantity} {item.unit} • {item.calories} cal/{item.unit}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <View style={styles.foodListShadowTop} />
            <View style={styles.foodListShadowBottom} />
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFoodPicker(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Food Log</Text>
      <Text style={styles.subtitle}>Total Calories Today: <Text style={styles.caloriesHighlight}>{totalCalories}</Text></Text>

      <View style={styles.inputCard}>
        <TouchableOpacity
          style={styles.foodSelectorFull}
          onPress={() => setShowFoodPicker(true)}
        >
          <Text style={selectedFood ? styles.selectedFoodText : styles.placeholderText}>
            {selectedFood ? selectedFood.name : 'Select food from inventory'}
          </Text>
        </TouchableOpacity>
        <View style={styles.inputRowBelow}>
          <TextInput
            style={styles.quantityInput}
            placeholder="Qty"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addFoodItem}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={foodItems}
        renderItem={renderFoodItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      {renderFoodPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2D3436',
  },
  subtitle: {
    fontSize: 18,
    color: '#636E72',
    marginBottom: 20,
  },
  caloriesHighlight: {
    color: '#00B894',
    fontWeight: 'bold',
    fontSize: 18,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  foodSelectorFull: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 10,
  },
  selectedFoodText: {
    color: '#2D3436',
    fontSize: 16,
  },
  placeholderText: {
    color: '#A0A0A0',
    fontSize: 16,
  },
  quantityInput: {
    width: 60,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#00B894',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  foodItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  foodItemContent: {
    flex: 1,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 15,
    color: '#636E72',
  },
  deleteButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  deleteButtonText: {
    color: '#FF7675',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  foodListScrollWrapper: {
    width: '100%',
    maxHeight: 250,
    marginBottom: 16,
    position: 'relative',
    justifyContent: 'center',
  },
  foodList: {
    width: '100%',
    maxHeight: 250,
    marginBottom: 16,
    paddingVertical: 2,
  },
  foodOptionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  foodOptionName: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: 'bold',
  },
  foodOptionDetails: {
    fontSize: 14,
    color: '#636E72',
  },
  closeButton: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  closeButtonText: {
    color: '#636E72',
    fontWeight: 'bold',
    fontSize: 16,
  },
  inputRowBelow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  foodListShadowTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    zIndex: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  foodListShadowBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    zIndex: 2,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
});

export default DailyFoodLogScreen;