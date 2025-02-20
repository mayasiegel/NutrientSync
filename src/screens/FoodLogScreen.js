import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList } from 'react-native';
import { foodLogStyles } from './styles'; // Import styles

const FoodLogScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [newFoodItem, setNewFoodItem] = useState('');
  
  const handleAddFood = () => {
    if (newFoodItem.trim()) {
      const foodItem = {
        id: Date.now().toString(),
        name: newFoodItem,
        nutrients: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      };
      setFoodItems([...foodItems, foodItem]);
      setNewFoodItem('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Log</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newFoodItem}
          onChangeText={setNewFoodItem}
          placeholder="Enter food name"
        />
        <Button title="Add" onPress={handleAddFood} />
      </View>

      <FlatList
        data={foodItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.foodItem}>
            <Text>{item.name}</Text>
            <Text>Calories: {item.nutrients.calories}</Text>
            <Text>Protein: {item.nutrients.protein}g</Text>
          </View>
        )}
      />
    </View>
  );
};

export default FoodLogScreen;