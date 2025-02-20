import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import menCalories from '../data/men_calories.json';
import womenCalories from '../data/women_calories.json';

const NutrientsScreen = () => {
  const [menGuidelines, setMenGuidelines] = useState(menCalories);
  const [womenGuidelines, setWomenGuidelines] = useState(womenCalories);

  // Now you can use menGuidelines and womenGuidelines directly
  // No need for async loading since JSON is bundled with the app

  return (
    <ScrollView>
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Men's Guidelines</Text>
        {menGuidelines.map((item, index) => (
          <View key={index}>
            <Text>Activity Level: {item.activity_level}</Text>
            <Text>Calories: {item.calories}</Text>
          </View>
        ))}

        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20 }}>Women's Guidelines</Text>
        {womenGuidelines.map((item, index) => (
          <View key={index}>
            <Text>Activity Level: {item.activity_level}</Text>
            <Text>Calories: {item.calories}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default NutrientsScreen;
