import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const MACROS = [
  {
    emoji: '💪',
    name: 'Protein',
    desc: 'Essential for muscle growth and repair',
    consumed: 47.5,
    goal: 50,
    range: '46-56g',
    unit: 'g',
  },
  {
    emoji: '⚡',
    name: 'Carbohydrates',
    desc: 'Primary energy source',
    consumed: 180,
    goal: 275,
    range: '225-325g',
    unit: 'g',
  },
  {
    emoji: '🫧',
    name: 'Fats',
    desc: 'Important for hormone production',
    consumed: 30,
    goal: 60,
    range: '44-77g',
    unit: 'g',
  },
];

const MICROS = [
  {
    emoji: '👁️',
    name: 'Vitamin A',
    desc: 'Vision and immune health',
    consumed: 600,
    goal: 800,
    range: '700-900mcg',
    unit: 'mcg',
  },
  {
    emoji: '🍊',
    name: 'Vitamin C',
    desc: 'Antioxidant and immune support',
    consumed: 45,
    goal: 75,
    range: '65-90mg',
    unit: 'g',
  },
  {
    emoji: '☀️',
    name: 'Vitamin D',
    desc: 'Bone health and immunity',
    consumed: 8,
    goal: 15,
    range: '15-20mcg',
    unit: 'g',
  },
];

function getPercent(consumed, goal) {
  if (!goal) return 0;
  return Math.round((consumed / goal) * 100);
}

function getColor(percent) {
  if (percent < 50) return '#e74c3c'; // red
  if (percent < 90) return '#f7b731'; // yellow
  return '#22b573'; // green
}

export default function NutrientsScreen() {
  const [tab, setTab] = useState('Macros');
  const dailyGoalPercent = 65;
  const nutrients = tab === 'Macros' ? MACROS : MICROS;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.titleSection}>
          <Text style={styles.appTitle}>Nutrients</Text>
          <Text style={styles.subtitle}>Track Your Daily Intake</Text>
        </View>
        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>Daily Goal</Text>
          <Text style={styles.goalPercent}>{dailyGoalPercent}%</Text>
        </View>
        <View style={styles.goalBarBg}>
          <View style={[styles.goalBar, { width: `${dailyGoalPercent}%` }]} />
        </View>
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'Macros' && styles.tabBtnActive]} onPress={() => setTab('Macros')}>
            <Text style={[styles.tabBtnText, tab === 'Macros' && styles.tabBtnTextActive]}>Macros</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'Micros' && styles.tabBtnActive]} onPress={() => setTab('Micros')}>
            <Text style={[styles.tabBtnText, tab === 'Micros' && styles.tabBtnTextActive]}>Micros</Text>
          </TouchableOpacity>
        </View>
        {nutrients.map((n, idx) => {
          const percent = getPercent(n.consumed, n.goal);
          const color = getColor(percent);
          return (
            <View key={n.name} style={styles.nutrientCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, marginRight: 8 }}>{n.emoji}</Text>
                  <Text style={styles.nutrientName}>{n.name}</Text>
                </View>
                <View style={styles.nutrientRangeBox}>
                  <Text style={styles.nutrientRange}>{n.range}</Text>
                </View>
              </View>
              <Text style={styles.nutrientDesc}>{n.desc}</Text>
              <Text style={styles.nutrientAmount}>{n.consumed}{n.unit} / {n.goal}{n.unit}</Text>
              <View style={styles.nutrientBarBg}>
                <View style={[styles.nutrientBar, { width: `${percent}%`, backgroundColor: color }]} />
              </View>
              <Text style={[styles.nutrientPercent, { color }]}>{percent}%</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  titleSection: { alignItems: 'flex-start', marginTop: 32, marginBottom: 8, marginLeft: 16 },
  appTitle: { fontSize: 32, fontWeight: 'bold', color: '#222' },
  subtitle: { fontSize: 18, color: '#555', marginTop: 4 },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginTop: 8 },
  goalLabel: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  goalPercent: { fontSize: 20, fontWeight: 'bold', color: '#4A90E2' },
  goalBarBg: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, marginHorizontal: 16, marginTop: 4, marginBottom: 16 },
  goalBar: { height: 10, backgroundColor: '#4A90E2', borderRadius: 5 },
  tabRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  tabBtn: { flex: 1, backgroundColor: '#e0e0e0', borderRadius: 12, marginHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#4A90E2' },
  tabBtnText: { fontSize: 18, color: '#222', fontWeight: 'bold' },
  tabBtnTextActive: { color: '#fff' },
  nutrientCard: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  nutrientName: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  nutrientRangeBox: { backgroundColor: '#e9f9f2', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  nutrientRange: { color: '#22b573', fontWeight: 'bold', fontSize: 14 },
  nutrientDesc: { fontSize: 13, color: '#888', marginTop: 4 },
  nutrientAmount: { fontSize: 13, color: '#444', marginTop: 8 },
  nutrientBarBg: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginTop: 8 },
  nutrientBar: { height: 8, borderRadius: 4 },
  nutrientPercent: { fontSize: 13, fontWeight: 'bold', marginTop: 8, alignSelf: 'flex-end' },
}); 