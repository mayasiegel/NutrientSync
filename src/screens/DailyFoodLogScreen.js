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
  const { inventory } = useInventory();

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
    };

    setFoodItems([...foodItems, newItem]);
    setTotalCalories(totalCalories + totalItemCalories);
    setSelectedFood(null);
    setQuantity('');
  };

  const deleteFoodItem = (id, itemCalories) => {
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
          <ScrollView style={styles.foodList}>
            {inventory.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.foodOption}
                onPress={() => {
                  setSelectedFood(item);
                  setShowFoodPicker(false);
                }}
              >
                <Text style={styles.foodOptionName}>{item.name}</Text>
                <Text style={styles.foodOptionDetails}>
                  {item.calories} cal/{item.unit}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
      <Text style={styles.subtitle}>Total Calories Today: {totalCalories}</Text>

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.foodSelector}
          onPress={() => setShowFoodPicker(true)}
        >
          <Text style={selectedFood ? styles.selectedFoodText : styles.placeholderText}>
            {selectedFood ? selectedFood.name : 'Select food from inventory'}
          </Text>
        </TouchableOpacity>
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

      <FlatList
        data={foodItems}
        renderItem={renderFoodItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      {renderFoodPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  foodSelector: {
    flex: 4,
    borderWidth: 1,
    borderColor: COLORS.glaucous,
    padding: 16,
    marginRight: 8,
    borderRadius: 5,
    backgroundColor: COLORS.whiteSmoke,
  },
  selectedFoodText: {
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.blackOlive,
  },
  quantityInput: {
    flex: 0.8,
    borderWidth: 1,
    borderColor: COLORS.glaucous,
    padding: 16,
    marginRight: 8,
    borderRadius: 5,
    backgroundColor: COLORS.whiteSmoke,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.text,
  },
  foodList: {
    maxHeight: 400,
  },
  foodOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glaucous,
  },
  foodOptionName: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  foodOptionDetails: {
    fontSize: SIZES.small,
    color: COLORS.blackOlive,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.error,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.whiteSmoke,
    fontWeight: 'bold',
  },
  foodItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glaucous,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.whiteSmoke,
    marginBottom: 8,
    borderRadius: 5,
  },
  foodItemContent: {
    flex: 1,
  },
  foodName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  foodDetails: {
    fontSize: SIZES.medium,
    color: COLORS.blackOlive,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 5,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.whiteSmoke,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 16,
  },
  deleteButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.error,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 5,
    minWidth: 70,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.whiteSmoke,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
});

export default DailyFoodLogScreen;