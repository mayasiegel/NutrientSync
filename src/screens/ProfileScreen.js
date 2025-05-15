import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import styles from '../styles/profile';
import theme from '../styles/theme';

const { COLORS } = theme;

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Auth buttons at top right */}
      <View style={styles.authButtonsContainer}>
        <TouchableOpacity style={styles.authButton} onPress={() => console.log('Login pressed')}>
          <Text style={styles.authButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.authButton} onPress={() => console.log('Sign Up pressed')}>
          <Text style={styles.authButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile header section */}
        <View style={styles.headerContainer}>
          {/* Circular profile picture placeholder */}
          <View style={styles.profilePictureCircle}>
            <Text style={styles.profilePictureEmoji}>👤</Text>
          </View>
          {/* User info section */}
          <View style={styles.userInfoContainer}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userDetails}>john.doe@example.com</Text>
            <Text style={styles.userDetails}>Member since: Jan 2023</Text>
          </View>
        </View>
        {/* Additional profile sections */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🧑 Personal Information</Text>
          <Text style={styles.sectionContent}>Age: 30</Text>
          <Text style={styles.sectionContent}>Location: New York</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>🌱 Preferences</Text>
          <Text style={styles.sectionContent}>Diet: Vegetarian</Text>
          <Text style={styles.sectionContent}>Allergies: None</Text>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>📊 Statistics</Text>
          <Text style={styles.sectionContent}>Meals logged: 120</Text>
          <Text style={styles.sectionContent}>Average calories: 2100/day</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
