import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { getNutritionRecommendations } from '../lib/sportSeasons';

const MACROS = [
  { name: 'Protein', range: '80-120g', desc: 'Essential for muscle repair and growth.', amount: 90, target: 100 },
  { name: 'Carbs', range: '200-300g', desc: 'Primary energy source for athletes.', amount: 220, target: 250 },
  { name: 'Fat', range: '50-80g', desc: 'Supports hormone production and energy.', amount: 60, target: 70 },
];
const MICROS = [
  { name: 'Iron', range: '8-18mg', desc: 'Supports oxygen transport.', amount: 12, target: 18 },
  { name: 'Calcium', range: '1000mg', desc: 'Essential for bone health.', amount: 800, target: 1000 },
  { name: 'Vitamin C', range: '75-90mg', desc: 'Boosts immune system.', amount: 60, target: 90 },
];

export default function NutrientsScreen() {
  const [tab, setTab] = useState('Macros');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    async function fetchProfileAndCalc() {
      setLoading(true);
      setError(null);
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) throw new Error('No user session found.');
        // Fetch profile
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profileError) throw new Error(profileError.message);
        setProfile(data);
        // Calculate recommendations using new goal and season data
        setRecommendations(calcRecommendations(data));
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfileAndCalc();
  }, []);

  function calcRecommendations(profile) {
    // Extract needed fields
    const { gender, age, weight_lbs, height_feet, height_inches, sport, activity_level, goal, season } = profile || {};
    if (!weight_lbs || !height_feet || !height_inches || !gender || !age) return null;
    
    // Convert units
    const weight_kg = parseFloat(weight_lbs) * 0.453592;
    const height_cm = (parseInt(height_feet) * 12 + parseInt(height_inches)) * 2.54;
    const age_num = parseInt(age);
    
    // BMR (Mifflin-St Jeor)
    let bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age_num;
    if (gender === 'Man') bmr += 5;
    else if (gender === 'Woman') bmr -= 161;
    
    // Activity factor
    let activityFactor = 1.2;
    if (activity_level === 'Lightly Active') activityFactor = 1.5;
    else if (activity_level === 'Active') activityFactor = 1.75;
    
    // Base calories
    let calories = Math.round(bmr * activityFactor);
    
    // Get goal and season-based recommendations
    const goalRecommendations = getNutritionRecommendations(goal || 'Maintain Weight', season || 'Offseason', sport);
    
    // Apply goal-based adjustments
    calories += goalRecommendations.calories;
    
    // Calculate macros based on goal recommendations
    const protein = Math.round(weight_kg * goalRecommendations.protein);
    const carbs = Math.round(weight_kg * goalRecommendations.carbs);
    const fat = Math.round(weight_kg * goalRecommendations.fat);
    
    // Hydration: 35ml/kg base, adjust for activity
    let hydrationMlPerKg = 35;
    if (season === 'Inseason') hydrationMlPerKg = 40;
    else if (activity_level === 'Active') hydrationMlPerKg = 38;
    
    const hydration = Math.round(weight_kg * (hydrationMlPerKg / 1000) * 1000) / 1000; // in L
    
    return {
      calories,
      protein,
      carbs,
      fat,
      hydration,
      goalRecommendations,
      proteinPerKg: goalRecommendations.protein,
      carbsPerKg: goalRecommendations.carbs,
      fatPerKg: goalRecommendations.fat,
      hydrationMlPerKg,
      notes: goalRecommendations.notes
    };
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#205081" />
        <Text style={styles.loadingText}>Calculating your nutrition needs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!recommendations) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Please complete your profile to get nutrition recommendations.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nutrition Recommendations</Text>
        <Text style={styles.subtitle}>Personalized for your goals and season</Text>
      </View>

      {/* Goal and Season Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Your Plan</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Goal:</Text>
          <Text style={styles.summaryValue}>{profile?.goal || 'Not set'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Season:</Text>
          <Text style={styles.summaryValue}>{profile?.season || 'Not set'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sport:</Text>
          <Text style={styles.summaryValue}>{profile?.sport || 'Not set'}</Text>
        </View>
      </View>

      {/* Daily Calories */}
      <View style={styles.calorieCard}>
        <Text style={styles.calorieTitle}>Daily Calories</Text>
        <Text style={styles.calorieAmount}>{recommendations.calories}</Text>
        <Text style={styles.calorieSubtext}>calories per day</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, tab === 'Macros' && styles.activeTab]} 
          onPress={() => setTab('Macros')}
        >
          <Text style={[styles.tabText, tab === 'Macros' && styles.activeTabText]}>Macronutrients</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, tab === 'Micros' && styles.activeTab]} 
          onPress={() => setTab('Micros')}
        >
          <Text style={[styles.tabText, tab === 'Micros' && styles.activeTabText]}>Micronutrients</Text>
        </TouchableOpacity>
      </View>

      {/* Macros Tab */}
      {tab === 'Macros' && (
        <View style={styles.tabContent}>
          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>Protein</Text>
              <Text style={styles.macroTarget}>{recommendations.protein}g</Text>
            </View>
            <Text style={styles.macroDesc}>Essential for muscle repair and growth</Text>
            <Text style={styles.macroNote}>Based on {recommendations.proteinPerKg}g per kg body weight</Text>
          </View>

          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>Carbohydrates</Text>
              <Text style={styles.macroTarget}>{recommendations.carbs}g</Text>
            </View>
            <Text style={styles.macroDesc}>Primary energy source for athletes</Text>
            <Text style={styles.macroNote}>Based on {recommendations.carbsPerKg}g per kg body weight</Text>
          </View>

          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>Fat</Text>
              <Text style={styles.macroTarget}>{recommendations.fat}g</Text>
            </View>
            <Text style={styles.macroDesc}>Supports hormone production and energy</Text>
            <Text style={styles.macroNote}>Based on {recommendations.fatPerKg}g per kg body weight</Text>
          </View>

          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>Hydration</Text>
              <Text style={styles.macroTarget}>{recommendations.hydration}L</Text>
            </View>
            <Text style={styles.macroDesc}>Daily water intake</Text>
            <Text style={styles.macroNote}>Based on {recommendations.hydrationMlPerKg}ml per kg body weight</Text>
          </View>
        </View>
      )}

      {/* Micros Tab */}
      {tab === 'Micros' && (
        <View style={styles.tabContent}>
          {MICROS.map((micro, index) => (
            <View key={index} style={styles.microCard}>
              <View style={styles.microHeader}>
                <Text style={styles.microName}>{micro.name}</Text>
                <Text style={styles.microTarget}>{micro.range}</Text>
              </View>
              <Text style={styles.microDesc}>{micro.desc}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes Section */}
      {recommendations.notes && recommendations.notes.length > 0 && (
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Nutrition Notes</Text>
          {recommendations.notes.map((note, index) => (
            <Text key={index} style={styles.noteText}>• {note}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { alignItems: 'flex-start', marginTop: 32, marginBottom: 8, marginLeft: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#222' },
  subtitle: { fontSize: 18, color: '#555', marginTop: 4 },
  summaryCard: { backgroundColor: '#e9f9f2', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16, alignItems: 'flex-start' },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#205081', marginBottom: 2 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  summaryLabel: { fontSize: 15, color: '#555' },
  summaryValue: { fontSize: 15, fontWeight: 'bold', color: '#22b573' },
  calorieCard: { backgroundColor: '#e9f9f2', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16, alignItems: 'flex-start' },
  calorieTitle: { fontSize: 18, fontWeight: 'bold', color: '#205081', marginBottom: 2 },
  calorieAmount: { fontSize: 20, fontWeight: 'bold', color: '#22b573', marginBottom: 4 },
  calorieSubtext: { fontSize: 14, color: '#555' },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  tab: { flex: 1, backgroundColor: '#e0e0e0', borderRadius: 12, marginHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  activeTab: { backgroundColor: '#4A90E2' },
  tabText: { fontSize: 18, color: '#222', fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  tabContent: { padding: 16 },
  macroCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  macroName: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  macroTarget: { fontSize: 18, fontWeight: 'bold', color: '#22b573' },
  macroDesc: { fontSize: 13, color: '#888', marginTop: 4 },
  macroNote: { fontSize: 13, color: '#444', marginTop: 8 },
  microCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  microHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  microName: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  microTarget: { fontSize: 18, fontWeight: 'bold', color: '#22b573' },
  microDesc: { fontSize: 13, color: '#888', marginTop: 4 },
  notesCard: { backgroundColor: '#e9f9f2', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16, alignItems: 'flex-start' },
  notesTitle: { fontSize: 18, fontWeight: 'bold', color: '#205081', marginBottom: 2 },
  noteText: { fontSize: 15, color: '#555', marginBottom: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#205081', marginTop: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: 'red', marginBottom: 16 },
  retryButton: { backgroundColor: '#4A90E2', borderRadius: 12, padding: 12 },
  retryButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
}); 