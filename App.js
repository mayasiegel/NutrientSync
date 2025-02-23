import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Wireframes from './src/screens/Wireframes';

function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <Wireframes />
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;