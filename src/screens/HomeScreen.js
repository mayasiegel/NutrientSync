import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

// Food shelf life database (in days) - typical expiration periods
const FOOD_SHELF_LIFE = {
  // Dairy (short shelf life - high urgency)
  'milk': 7,
  'yogurt': 14,
  'cheese': 21,
  'butter': 30,
  'cream': 7,
  'sour cream': 14,
  
  // Meat (short shelf life - high urgency)
  'chicken': 3,
  'beef': 5,
  'pork': 5,
  'fish': 2,
  'salmon': 2,
  'tuna': 2,
  'turkey': 3,
  'lamb': 5,
  'steak': 5,
  'ground beef': 2,
  'bacon': 7,
  'sausage': 7,
  'ham': 7,
  
  // Fruits (medium shelf life)
  'apple': 14,
  'banana': 7,
  'orange': 14,
  'strawberry': 7,
  'blueberry': 7,
  'raspberry': 5,
  'grape': 7,
  'peach': 7,
  'pear': 7,
  'pineapple': 7,
  'mango': 7,
  'avocado': 5,
  'tomato': 7,
  
  // Vegetables (medium shelf life)
  'lettuce': 7,
  'spinach': 7,
  'kale': 7,
  'broccoli': 7,
  'carrot': 14,
  'celery': 14,
  'cucumber': 7,
  'bell pepper': 7,
  'onion': 30,
  'potato': 30,
  'sweet potato': 30,
  'garlic': 60,
  'ginger': 30,
  'mushroom': 7,
  'zucchini': 7,
  'squash': 14,
  'corn': 7,
  'peas': 7,
  'green beans': 7,
  
  // Grains & Pantry (long shelf life - low urgency)
  'rice': 365,
  'pasta': 365,
  'bread': 7,
  'tortilla': 14,
  'cereal': 180,
  'oatmeal': 365,
  'quinoa': 365,
  'flour': 365,
  'sugar': 730,
  'honey': 730,
  'oil': 365,
  'vinegar': 730,
  'sauce': 180,
  'soup': 365,
  'canned': 365,
  'chips': 60,
  'crackers': 180,
  'nuts': 180,
  'seeds': 180,
  
  // Default for unknown foods
  'default': 14
};

// Mock data for graphs
const proteinData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [80, 90, 70, 85, 100, 60, 95],
      color: () => '#222',
      strokeWidth: 3,
    },
  ],
};
const caloriesData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [1800, 2000, 1700, 2100, 2200, 1600, 2000],
      color: () => '#3578e5',
      strokeWidth: 3,
    },
  ],
};

export default function HomeScreen(props) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expirationAlerts, setExpirationAlerts] = useState([]);
  const [profile, setProfile] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchInventoryAndCalculateAlerts();
    fetchProfile();
  }, []);

  async function fetchInventoryAndCalculateAlerts() {
    setLoading(true);
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        console.log('No user session found');
        setLoading(false);
        return;
      }

      // For now, use mock data since we don't have a real inventory table yet
      // In a real app, you'd fetch from: supabase.from('inventory').select('*').eq('user_id', session.user.id)
      const mockInventory = [
        { id: '1', name: 'Milk', expiration: '2025-01-20', category: 'Dairy' },
        { id: '2', name: 'Chicken Breast', expiration: '2025-01-18', category: 'Meat' },
        { id: '3', name: 'Apples', expiration: '2025-01-25', category: 'Fruits' },
        { id: '4', name: 'Rice', expiration: '2025-12-01', category: 'Grains' },
        { id: '5', name: 'Yogurt', expiration: '2025-01-22', category: 'Dairy' },
        { id: '6', name: 'Salmon', expiration: '2025-01-17', category: 'Meat' },
        { id: '7', name: 'Bread', expiration: '2025-01-23', category: 'Grains' },
        { id: '8', name: 'Avocados', expiration: '2025-01-19', category: 'Fruits' },
      ];

      setInventory(mockInventory);
      calculateExpirationAlerts(mockInventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    try {
      const { data: { user }, error: profileError } = await supabase.auth.getUser();
      if (profileError || !user) {
        console.log('No user profile found');
        setProfile(null);
        return;
      }

      setProfile(user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  function calculateExpirationAlerts(foods) {
    const today = new Date();
    const alerts = [];

    foods.forEach(food => {
      if (!food.expiration) return;

      const expirationDate = new Date(food.expiration);
      const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

      // Get shelf life for this food
      const foodName = food.name.toLowerCase();
      let shelfLife = FOOD_SHELF_LIFE.default;
      
      // Find matching shelf life
      for (const [key, days] of Object.entries(FOOD_SHELF_LIFE)) {
        if (foodName.includes(key)) {
          shelfLife = days;
          break;
        }
      }

      // Calculate urgency based on days remaining vs typical shelf life
      const urgencyRatio = daysUntilExpiration / shelfLife;
      let urgency = 'low';
      let alertText = '';

      if (daysUntilExpiration <= 0) {
        urgency = 'expired';
        alertText = `⚠️ ${food.name} has expired!`;
      } else if (urgencyRatio <= 0.25) {
        urgency = 'critical';
        alertText = `🚨 ${food.name} expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}!`;
      } else if (urgencyRatio <= 0.5) {
        urgency = 'high';
        alertText = `⚠️ ${food.name} expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}`;
      } else if (urgencyRatio <= 0.75) {
        urgency = 'medium';
        alertText = `📅 ${food.name} expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}`;
      }

      if (alertText) {
        alerts.push({
          id: food.id,
          text: alertText,
          urgency,
          daysUntilExpiration,
          foodName: food.name,
          category: food.category
        });
      }
    });

    // Sort by urgency (expired > critical > high > medium > low)
    const urgencyOrder = { 'expired': 0, 'critical': 1, 'high': 2, 'medium': 3, 'low': 4 };
    alerts.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    setExpirationAlerts(alerts);
  }

  function getAlertStyle(urgency) {
    switch (urgency) {
      case 'expired':
        return { backgroundColor: '#ffebee', borderLeftColor: '#f44336' };
      case 'critical':
        return { backgroundColor: '#fff3e0', borderLeftColor: '#ff9800' };
      case 'high':
        return { backgroundColor: '#fff8e1', borderLeftColor: '#ffc107' };
      case 'medium':
        return { backgroundColor: '#e8f5e8', borderLeftColor: '#4caf50' };
      default:
        return { backgroundColor: '#f5f5f5', borderLeftColor: '#9e9e9e' };
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.appTitle}>NutrientSync</Text>
        <TouchableOpacity>
          <Image source={require('../../assets/icon.png')} style={styles.settingsIcon} />
        </TouchableOpacity>
      </View>

      {/* Expiration Alerts */}
      {loading ? (
        <ActivityIndicator size="small" style={{ marginVertical: 16 }} />
      ) : expirationAlerts.length > 0 ? (
        <View style={styles.alertsSection}>
          <Text style={styles.alertsTitle}>⚠️ Expiration Alerts</Text>
          {expirationAlerts.slice(0, 3).map((alert) => (
            <View key={alert.id} style={[styles.alertCard, getAlertStyle(alert.urgency)]}>
              <Text style={styles.alertText}>{alert.text}</Text>
              <Text style={styles.alertCategory}>{alert.category}</Text>
        </View>
          ))}
          {expirationAlerts.length > 3 && (
            <Text style={styles.moreAlerts}>+{expirationAlerts.length - 3} more items expiring soon</Text>
          )}
        </View>
      ) : null}

      {/* Inventory-Based Meal Planner Button */}
      <View style={styles.mealPlannerCardBtnGreen}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={() => navigation.navigate('MealPlanner')}>
          <Text style={styles.mealPlannerEmoji}>🥗</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.mealPlannerCardTitle}>Inventory Meal Planner</Text>
            <Text style={styles.mealPlannerCardDesc}>See meal ideas you can make with what you have.</Text>
          </View>
          <Text style={styles.mealPlannerArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* AI Meal Planner Button */}
      <View style={styles.aiMealSection}>
        <TouchableOpacity 
          style={styles.aiMealButton}
          onPress={() => navigation.navigate('AIMealPlanner')}
        >
          <View style={styles.aiMealContent}>
            <Text style={styles.aiMealIcon}>🤖</Text>
            <View style={styles.aiMealTextContainer}>
              <Text style={styles.aiMealTitle}>AI Meal Planner</Text>
              <Text style={styles.aiMealSubtitle}>Let our AI chatbot suggest creative meals based on your goals.</Text>
        </View>
            <Text style={styles.aiMealArrow}>→</Text>
          </View>
        </TouchableOpacity>
          </View>

      {/* Today's Performance */}
      <Text style={styles.sectionTitle}>Today's Performance</Text>
      <View style={styles.performanceCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Protein Intake</Text>
          <Text style={styles.progressValue}>80/100g</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: '80%' }]} />
        </View>
        <Text style={styles.progressSubLabel}>Target: 100g</Text>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Hydration</Text>
          <Text style={styles.progressValue}>3/5L</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: '60%', backgroundColor: '#3578e5' }]} />
        </View>
        <Text style={styles.progressSubLabel}>Target: 5L</Text>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Energy Balance</Text>
          <Text style={styles.progressValue}>1500/2000 kcal</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: '75%', backgroundColor: '#f7b731' }]} />
        </View>
        <Text style={styles.progressSubLabel}>Target: 2000 kcal</Text>
      </View>

      {/* Streak Display */}
      <View style={styles.streakContainer}>
        <Text style={styles.streakFlame}>🔥</Text>
        <Text style={styles.streakText}>
          {profile?.current_streak > 0
            ? `You're on a ${profile.current_streak}-day streak!`
            : "Start logging food to begin your streak!"}
        </Text>
        {profile?.current_streak > 0 && (
          <Text style={styles.streakSubtext}>
            Longest streak: {profile.longest_streak} days
          </Text>
        )}
        {/* Optional: Milestone message */}
        {profile?.current_streak === 10 && <Text style={styles.streakMilestone}>🎉 10-day milestone! Keep it up!</Text>}
        {profile?.current_streak === 25 && <Text style={styles.streakMilestone}>🏅 25-day milestone! Amazing!</Text>}
      </View>

      {/* Weekly Protein Intake Graph */}
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>Weekly Protein Intake</Text>
        <Text style={styles.graphAvg}>Avg: <Text style={{ fontWeight: 'bold' }}>90g</Text></Text>
        <Text style={styles.graphChange}>Last 7 Days <Text style={{ color: '#27ae60', fontWeight: 'bold' }}>+10%</Text></Text>
        <LineChart
          data={proteinData}
          width={screenWidth - 40}
          height={160}
          chartConfig={graphConfig}
          bezier
          style={styles.lineChart}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withShadow={false}
        />
      </View>

      {/* Weekly Calorie Intake Graph */}
      <View style={styles.graphCard}>
        <Text style={styles.graphTitle}>Weekly Calorie Intake</Text>
        <Text style={styles.graphAvg}>Avg: <Text style={{ fontWeight: 'bold' }}>1950 kcal</Text></Text>
        <Text style={styles.graphChange}>Last 7 Days <Text style={{ color: '#27ae60', fontWeight: 'bold' }}>+5%</Text></Text>
        <LineChart
          data={caloriesData}
          width={screenWidth - 40}
          height={160}
          chartConfig={graphConfigCalories}
          bezier
          style={styles.lineChart}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withShadow={false}
        />
        </View>

      {/* Achievements */}
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievementsGrid}>
        <View style={styles.achievementIcon}><Image source={require('../../assets/icon.png')} style={styles.achievementImg} /></View>
        <View style={styles.achievementIcon}><Image source={require('../../assets/icon.png')} style={styles.achievementImg} /></View>
        <View style={styles.achievementIcon}><Image source={require('../../assets/icon.png')} style={styles.achievementImg} /></View>
        </View>

      {/* Performance Tips */}
      <Text style={styles.sectionTitle}>Performance Tips</Text>
      <View style={styles.tipCard}>
        <Image source={require('../../assets/icon.png')} style={styles.tipImg} />
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Fuel Your Training</Text>
          <Text style={styles.tipText}>Optimize your nutrition for peak performance. Focus on protein-rich foods and stay hydrated.</Text>
          </View>
        </View>
    </ScrollView>
  );
}

const graphConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: () => '#222',
  labelColor: () => '#888',
  strokeWidth: 3,
  propsForBackgroundLines: { stroke: 'none' },
  propsForLabels: { fontSize: 13, fontWeight: 'bold' },
};
const graphConfigCalories = {
  ...graphConfig,
  color: () => '#3578e5',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafd' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, marginBottom: 8, marginHorizontal: 20 },
  appTitle: { fontSize: 24, fontWeight: 'bold', color: '#222' },
  settingsIcon: { width: 28, height: 28, borderRadius: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#222', marginLeft: 20, marginTop: 24, marginBottom: 8 },
  performanceCard: { backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 20, marginBottom: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  progressLabel: { fontSize: 16, color: '#222', fontWeight: '500' },
  progressValue: { fontSize: 15, color: '#222', fontWeight: 'bold' },
  progressBarBg: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8, marginTop: 2, width: '100%' },
  progressBar: { height: 8, backgroundColor: '#222', borderRadius: 4 },
  progressSubLabel: { fontSize: 13, color: '#888', marginBottom: 8 },
  graphCard: { backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 20, marginBottom: 20, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  graphTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  graphAvg: { fontSize: 20, color: '#222', marginBottom: 2 },
  graphChange: { fontSize: 14, color: '#888', marginBottom: 8 },
  lineChart: { marginVertical: 8, borderRadius: 12 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginHorizontal: 20, marginBottom: 24 },
  achievementIcon: { width: 70, height: 70, backgroundColor: '#f7fafd', borderRadius: 16, marginRight: 16, marginBottom: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
  achievementImg: { width: 40, height: 40 },
  tipCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 20, marginBottom: 32, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  tipImg: { width: 60, height: 60, borderRadius: 12, marginRight: 16 },
  tipTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  tipText: { fontSize: 14, color: '#555' },
  alertsSection: { marginHorizontal: 20, marginBottom: 16 },
  alertsTitle: { fontSize: 18, fontWeight: 'bold', color: '#d32f2f', marginBottom: 8 },
  alertCard: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 8,
    borderLeftWidth: 4
  },
  alertText: { fontSize: 14, fontWeight: '500', color: '#333', flex: 1 },
  alertCategory: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  moreAlerts: { fontSize: 12, color: '#666', textAlign: 'center', fontStyle: 'italic' },
  aiMealSection: { marginHorizontal: 20, marginBottom: 16 },
  aiMealButton: { 
    backgroundColor: '#007AFF', 
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiMealContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiMealIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  aiMealTextContainer: {
    flex: 1,
  },
  aiMealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  aiMealSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  aiMealArrow: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  streakContainer: { alignItems: 'center', marginVertical: 16 },
  streakFlame: { fontSize: 40, marginBottom: 4 },
  streakText: { fontSize: 18, fontWeight: 'bold', color: '#e67e22' },
  streakSubtext: { fontSize: 14, color: '#888' },
  streakMilestone: { fontSize: 16, color: '#22b573', fontWeight: 'bold', marginTop: 6 },
  mealPlannerCardBtnGreen: {
    backgroundColor: '#22b573',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  mealPlannerEmoji: { fontSize: 32, marginRight: 16 },
  mealPlannerCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  mealPlannerCardDesc: { fontSize: 14, color: '#eafff2', marginTop: 2 },
  mealPlannerArrow: { fontSize: 28, color: '#fff', marginLeft: 12 },
  mealPlannerCardBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  mealPlannerCardBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#205081',
    letterSpacing: 0.5,
  },
}); 