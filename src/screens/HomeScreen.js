import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* User specific information section */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.sectionTitle}>User specific information</Text>
        </View>
        
        <View style={styles.contentContainer}>
          {/* Left column with multiple sections */}
          <View style={styles.leftColumn}>
            <View style={styles.leftSection}>
              {/* Content for first left section */}
              <Text>Section 1</Text>
            </View>
            
            <View style={styles.leftSection}>
              {/* Content for second left section */}
              <Text>Section 2</Text>
            </View>
            
            <View style={styles.leftSection}>
              {/* Content for third left section */}
              <Text>Section 3</Text>
            </View>
            
            <View style={styles.leftSection}>
              {/* Content for fourth left section */}
              <Text>Section 4</Text>
            </View>
          </View>
          
          {/* Right column with one tall section */}
          <View style={styles.rightColumn}>
            <View style={styles.rightSection}>
              {/* Content for right section */}
              <Text>Right Section</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

