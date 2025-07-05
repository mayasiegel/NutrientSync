import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { getNutritionRecommendations } from '../lib/sportSeasons';

const MACROS = [
  { name: 'Protein', range: '80-120g', desc: 'Essential for muscle repair and growth.', target: 100 },
  { name: 'Carbs', range: '200-300g', desc: 'Primary energy source for athletes.', target: 250 },
  { name: 'Fat', range: '50-80g', desc: 'Supports hormone production and energy.', target: 70 },
];
const MICROS = [
  { name: 'Iron', range: '8-18mg', desc: 'Supports oxygen transport.', target: 15, unit: 'mg' },
  { name: 'Calcium', range: '1000mg', desc: 'Essential for bone health.', target: 1000, unit: 'mg' },
  { name: 'Vitamin C', range: '75-90mg', desc: 'Boosts immune system.', target: 90, unit: 'mg' },
];

export default function NutrientsScreen() {
  const [tab, setTab] = useState('Macros');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    iron: 0,
    calcium: 0,
    vitaminC: 0,
  });

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
        
        // Calculate daily totals from food log
        calculateDailyTotals();
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

  async function calculateDailyTotals() {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        console.log('No user session found');
        return;
      }

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('daily_log')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('log_date', today);

      if (error) {
        console.error('Error fetching daily log for totals:', error);
        return;
      }

      const dailyLog = data || [];
      const totals = {
        calories: dailyLog.reduce((sum, item) => sum + (item.calories || 0) * item.quantity, 0),
        protein: dailyLog.reduce((sum, item) => sum + (item.protein || 0) * item.quantity, 0),
        carbs: dailyLog.reduce((sum, item) => sum + (item.carbs || 0) * item.quantity, 0),
        fat: dailyLog.reduce((sum, item) => sum + (item.fat || 0) * item.quantity, 0),
        iron: dailyLog.reduce((sum, item) => sum + (item.iron || 0) * item.quantity, 0),
        calcium: dailyLog.reduce((sum, item) => sum + (item.calcium || 0) * item.quantity, 0),
        vitaminC: dailyLog.reduce((sum, item) => sum + (item.vitamin_c || 0) * item.quantity, 0),
      };
      setDailyTotals(totals);
    } catch (error) {
      console.error('Error calculating daily totals:', error);
    }
  }

  // Helper function to calculate progress percentage
  const getProgressPercentage = (consumed, target) => {
    if (target === 0) return 0;
    return Math.min((consumed / target) * 100, 100);
  };

  // Helper function to get progress bar color
  const getProgressColor = (consumed, target) => {
    const percentage = getProgressPercentage(consumed, target);
    if (percentage >= 100) return '#22b573'; // Green for completed
    if (percentage >= 80) return '#f39c12'; // Orange for close
    return '#e74c3c'; // Red for low
  };

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

      {/* Daily Calories with Progress */}
      <View style={styles.calorieCard}>
        <View style={styles.calorieHeader}>
          <Text style={styles.calorieTitle}>Daily Calories</Text>
          <Text style={styles.calorieProgress}>
            {dailyTotals.calories}/{recommendations.calories}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${getProgressPercentage(dailyTotals.calories, recommendations.calories)}%`,
                  backgroundColor: getProgressColor(dailyTotals.calories, recommendations.calories)
                }
              ]} 
            />
          </View>
        </View>
        <Text style={styles.calorieSubtext}>
          {getProgressPercentage(dailyTotals.calories, recommendations.calories).toFixed(1)}% of daily target
        </Text>
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
              <Text style={styles.macroProgress}>
                {dailyTotals.protein.toFixed(1)}/{recommendations.protein}g
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${getProgressPercentage(dailyTotals.protein, recommendations.protein)}%`,
                      backgroundColor: getProgressColor(dailyTotals.protein, recommendations.protein)
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.macroDesc}>Essential for muscle repair and growth</Text>
            <Text style={styles.macroNote}>
              {getProgressPercentage(dailyTotals.protein, recommendations.protein).toFixed(1)}% of daily target • Based on {recommendations.proteinPerKg}g per kg body weight
            </Text>
          </View>

          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>Carbohydrates</Text>
              <Text style={styles.macroProgress}>
                {dailyTotals.carbs.toFixed(1)}/{recommendations.carbs}g
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${getProgressPercentage(dailyTotals.carbs, recommendations.carbs)}%`,
                      backgroundColor: getProgressColor(dailyTotals.carbs, recommendations.carbs)
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.macroDesc}>Primary energy source for athletes</Text>
            <Text style={styles.macroNote}>
              {getProgressPercentage(dailyTotals.carbs, recommendations.carbs).toFixed(1)}% of daily target • Based on {recommendations.carbsPerKg}g per kg body weight
            </Text>
          </View>

          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroName}>Fat</Text>
              <Text style={styles.macroProgress}>
                {dailyTotals.fat.toFixed(1)}/{recommendations.fat}g
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${getProgressPercentage(dailyTotals.fat, recommendations.fat)}%`,
                      backgroundColor: getProgressColor(dailyTotals.fat, recommendations.fat)
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.macroDesc}>Supports hormone production and energy</Text>
            <Text style={styles.macroNote}>
              {getProgressPercentage(dailyTotals.fat, recommendations.fat).toFixed(1)}% of daily target • Based on {recommendations.fatPerKg}g per kg body weight
            </Text>
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
          <View style={styles.microCard}>
            <View style={styles.microHeader}>
              <Text style={styles.microName}>Iron</Text>
              <Text style={styles.microProgress}>
                {dailyTotals.iron.toFixed(1)}/{MICROS[0].target}{MICROS[0].unit}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${getProgressPercentage(dailyTotals.iron, MICROS[0].target)}%`,
                      backgroundColor: getProgressColor(dailyTotals.iron, MICROS[0].target)
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.microDesc}>Supports oxygen transport</Text>
            <Text style={styles.microNote}>
              {getProgressPercentage(dailyTotals.iron, MICROS[0].target).toFixed(1)}% of daily target • Recommended: {MICROS[0].range}
            </Text>
          </View>

          <View style={styles.microCard}>
            <View style={styles.microHeader}>
              <Text style={styles.microName}>Calcium</Text>
              <Text style={styles.microProgress}>
                {dailyTotals.calcium.toFixed(0)}/{MICROS[1].target}{MICROS[1].unit}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${getProgressPercentage(dailyTotals.calcium, MICROS[1].target)}%`,
                      backgroundColor: getProgressColor(dailyTotals.calcium, MICROS[1].target)
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.microDesc}>Essential for bone health</Text>
            <Text style={styles.microNote}>
              {getProgressPercentage(dailyTotals.calcium, MICROS[1].target).toFixed(1)}% of daily target • Recommended: {MICROS[1].range}
            </Text>
          </View>

          <View style={styles.microCard}>
            <View style={styles.microHeader}>
              <Text style={styles.microName}>Vitamin C</Text>
              <Text style={styles.microProgress}>
                {dailyTotals.vitaminC.toFixed(1)}/{MICROS[2].target}{MICROS[2].unit}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      width: `${getProgressPercentage(dailyTotals.vitaminC, MICROS[2].target)}%`,
                      backgroundColor: getProgressColor(dailyTotals.vitaminC, MICROS[2].target)
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.microDesc}>Boosts immune system</Text>
            <Text style={styles.microNote}>
              {getProgressPercentage(dailyTotals.vitaminC, MICROS[2].target).toFixed(1)}% of daily target • Recommended: {MICROS[2].range}
            </Text>
          </View>
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
  calorieHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, width: '100%' },
  calorieTitle: { fontSize: 18, fontWeight: 'bold', color: '#205081' },
  calorieProgress: { fontSize: 18, fontWeight: 'bold', color: '#22b573' },
  calorieSubtext: { fontSize: 14, color: '#555', marginTop: 8 },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  tab: { flex: 1, backgroundColor: '#e0e0e0', borderRadius: 12, marginHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  activeTab: { backgroundColor: '#4A90E2' },
  tabText: { fontSize: 18, color: '#222', fontWeight: 'bold' },
  activeTabText: { color: '#fff' },
  tabContent: { padding: 16 },
  macroCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  macroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  macroName: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  macroProgress: { fontSize: 18, fontWeight: 'bold', color: '#22b573' },
  macroTarget: { fontSize: 18, fontWeight: 'bold', color: '#22b573' },
  macroDesc: { fontSize: 13, color: '#888', marginTop: 4 },
  macroNote: { fontSize: 13, color: '#444', marginTop: 8 },
  microCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  microHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  microName: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  microProgress: { fontSize: 18, fontWeight: 'bold', color: '#22b573' },
  microTarget: { fontSize: 18, fontWeight: 'bold', color: '#22b573' },
  microDesc: { fontSize: 13, color: '#888', marginTop: 4 },
  microNote: { fontSize: 13, color: '#444', marginTop: 8 },
  progressBarContainer: { marginBottom: 8 },
  progressBarBackground: { 
    height: 8, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBar: { 
    height: '100%', 
    borderRadius: 4,
    minWidth: 4
  },
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