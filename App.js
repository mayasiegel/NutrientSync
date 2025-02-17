import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import FoodLogScreen from './src/screens/FoodLogScreen';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <FoodLogScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;