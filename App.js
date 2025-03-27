import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Wireframes from './src/screens/Wireframes';
import { InventoryProvider } from './src/context/InventoryContext';

function App() {
  return (
    <NavigationContainer>
      <InventoryProvider>
        <SafeAreaView style={styles.container}>
          <Wireframes />
        </SafeAreaView>
      </InventoryProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;