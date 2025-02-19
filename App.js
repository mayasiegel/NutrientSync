import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Wireframes from './src/screens/Wireframes';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Wireframes />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;