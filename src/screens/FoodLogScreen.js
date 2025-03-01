import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { foodLogStyles } from '../styles'; // Import styles

const FoodLogScreen = () => {
  const [foodItems, setFoodItems] = useState([
    // Example food item
    { id: '1', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { id: '2', name: 'Granola Bar', calories: 190, protein: 3, carbs: 28, fat: 8 },
  ]);
  const [newFood, setNewFood] = useState('');
  
  const handleAddFood = () => {
    if (newFood.trim()) {
      // Create new food item with unique ID
      const newItem = {
        id: Date.now().toString(), // unique ID
        name: newFood,
        calories: 0,  // default values
        protein: 0,
        carbs: 0,
        fat: 0,
      };
      
      setFoodItems([...foodItems, newItem]);
      setNewFood(''); // Clear input after adding
    }
  };

  const handleDeleteFood = (id) => {
    setFoodItems(foodItems.filter(item => item.id !== id));
  };

  const renderFoodItem = ({ item }) => (
    <View style={foodLogStyles.foodItem}>
      <View style={foodLogStyles.foodItemContent}>
        <Text style={foodLogStyles.foodName}>{item.name}</Text>
        <Text style={foodLogStyles.foodDetails}>
          Calories: {item.calories} • Protein: {item.protein}g • Carbs: {item.carbs}g • Fat: {item.fat}g
        </Text>
      </View>
      <TouchableOpacity 
        style={foodLogStyles.deleteButton}
        onPress={() => handleDeleteFood(item.id)}
      >
        <Text style={foodLogStyles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={foodLogStyles.container}>
      <Text style={foodLogStyles.title}>Food Log</Text>
      
      <View style={foodLogStyles.inputContainer}>
        <TextInput
          style={foodLogStyles.input}
          value={newFood}
          onChangeText={setNewFood}
          placeholder="Enter food name"
          onSubmitEditing={handleAddFood}
          returnKeyType="done"
        />
        <TouchableOpacity 
          style={foodLogStyles.addButton}
          onPress={handleAddFood}
        >
          <Text style={foodLogStyles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={foodLogStyles.buttonContainer}>
        <TouchableOpacity 
          style={[foodLogStyles.button, { backgroundColor: '#235789' }]}
          onPress={() => console.log('Scanned food')}
        >
          <Text style={foodLogStyles.scanCustomButtonText}>Add Scanned Food</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[foodLogStyles.button, { backgroundColor: '#235789' }]}
          onPress={() => console.log('Custom food')}
        >
          <Text style={foodLogStyles.scanCustomButtonText}>Add Custom Food</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={foodItems}
        renderItem={renderFoodItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default FoodLogScreen;