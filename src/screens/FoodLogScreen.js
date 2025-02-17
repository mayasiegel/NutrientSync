import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, FlatList } from 'react-native';

const FoodLogScreen = () => {
  const [foods, setFoods] = useState([]);
  const [newFood, setNewFood] = useState('');
  
  const addFood = () => {
    if (newFood.trim()) {
      const foodItem = {
        id: Date.now().toString(),
        name: newFood,
        nutrients: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      };
      setFoods([...foods, foodItem]);
      setNewFood('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Log</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newFood}
          onChangeText={setNewFood}
          placeholder="Enter food name"
        />
        <Button title="Add" onPress={addFood} />
      </View>

      <FlatList
        data={foods}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
  },
  foodItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default FoodLogScreen;