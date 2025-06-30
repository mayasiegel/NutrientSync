import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* App Title */}
      <View style={styles.titleSection}>
        <Text style={styles.appTitle}>NutrientSync</Text>
        <Text style={styles.subtitle}>Your Personal Nutrient Tracker</Text>
      </View>
      {/* Top Summary Cards */}
      <View style={styles.topSummaryRow}>
        <View style={styles.summaryCardSmall}>
          <Text style={styles.summaryCardValue}>2,450</Text>
          <Text style={styles.summaryCardLabel}>Daily Calories</Text>
        </View>
        <View style={styles.summaryCardSmall}>
          <Text style={styles.summaryCardValue}>75%</Text>
          <Text style={styles.summaryCardLabel}>Goal Progress</Text>
        </View>
        <View style={styles.summaryCardSmall}>
          <Text style={styles.summaryCardValue}>3</Text>
          <Text style={styles.summaryCardLabel}>Meals Today</Text>
        </View>
      </View>
      {/* Streak Section */}
      <View style={styles.streakSection}>
        <Text style={styles.streakTitle}>🔥 Current Streak</Text>
        <Text style={styles.streakSubtitle}>Keep it going!</Text>
        <View style={styles.streakRow}>
          <View style={styles.streakCol}>
            <Text style={styles.streakNumber}>12</Text>
            <Text style={styles.streakLabel}>days</Text>
          </View>
          <View style={styles.streakCol}>
            <Text style={styles.streakNumber}>30</Text>
            <Text style={styles.streakLabel}>Longest</Text>
          </View>
          <View style={styles.streakCol}>
            <Text style={styles.streakNumber}>21</Text>
            <Text style={styles.streakLabel}>Goal</Text>
          </View>
        </View>
      </View>
      {/* Today's Summary */}
      <Text style={styles.sectionTitle}>Today's Summary</Text>
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Calories</Text>
        <Text style={styles.summaryValue}>1,840 / 2,450</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: '75%' }]} />
        </View>
        <Text style={styles.summaryLabel}>Protein</Text>
        <Text style={styles.summaryValue}>65g / 80g</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: '81%' }]} />
        </View>
        <Text style={styles.summaryLabel}>Carbs</Text>
        <Text style={styles.summaryValue}>220g / 300g</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: '73%' }]} />
        </View>
      </View>
      {/* Expiring Soon */}
      <Text style={styles.sectionTitle}>Expiring Soon</Text>
      <View style={styles.expiringBoxAesthetic}>
        <View style={styles.expiringRowAesthetic}>
          <Text style={styles.expiringItem}>Milk</Text>
          <Text style={styles.expiringTime}>2 days left</Text>
        </View>
        <View style={styles.expiringRowAesthetic}>
          <Text style={styles.expiringItem}>Yogurt</Text>
          <Text style={styles.expiringTime}>3 days left</Text>
        </View>
        <View style={styles.expiringRowAesthetic}>
          <Text style={styles.expiringItem}>Chicken</Text>
          <Text style={styles.expiringTime}>1 day left</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  titleSection: {
    alignItems: 'flex-start',
    marginTop: 32,
    marginBottom: 8,
    marginLeft: 16,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#222',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginTop: 4,
  },
  topSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 16,
  },
  summaryCardSmall: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    width: 85,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  summaryCardLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
    textAlign: 'center',
  },
  streakSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  streakSubtitle: {
    color: '#555',
    marginBottom: 12,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  streakCol: {
    flex: 1,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3578e5',
  },
  streakLabel: {
    color: '#555',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    marginTop: 2,
    width: '100%',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  expiringBoxAesthetic: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expiringRowAesthetic: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expiringItem: {
    fontSize: 16,
    color: '#222',
  },
  expiringTime: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
}); 