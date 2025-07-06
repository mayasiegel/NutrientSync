import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Modal, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { getMealsByIngredient, getMealDetailsById } from '../services/mealDbService';

// Keywords and categories to exclude for athlete-friendly, simple meals
const EXCLUDED_CATEGORIES = ['Dessert'];
const EXCLUDED_KEYWORDS = [
  'cake', 'pudding', 'tart', 'gateau', 'brownie', 'cookie', 'pie', 'mousse', 'ice cream'
];
// Assume user always has these staples
const STAPLES = ['milk', 'butter', 'salt', 'pepper', 'oil', 'sugar', 'flour', 'water', 'baking powder', 'baking soda'];
const MEAL_TYPES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'];

export default function MealPlannerScreen() {
  const [inventory, setInventory] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [mealDetails, setMealDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [mealTypeFilter, setMealTypeFilter] = useState('All');
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logMealType, setLogMealType] = useState('Lunch');
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    fetchInventoryAndMeals();
  }, []);

  async function fetchInventoryAndMeals() {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const { data, error: invError } = await supabase
        .from('inventory')
        .select('name')
        .eq('user_id', user.id);
      if (invError) throw invError;
      setInventory(data || []);
      // Get unique ingredient names
      const ingredients = [...new Set((data || []).map(f => f.name).filter(Boolean))];
      // Fetch meals for each ingredient
      let allMeals = [];
      for (const ingredient of ingredients) {
        const mealsForIngredient = await getMealsByIngredient(ingredient);
        if (mealsForIngredient) allMeals = allMeals.concat(mealsForIngredient);
      }
      // Deduplicate by meal id
      const uniqueMeals = Object.values(
        allMeals.reduce((acc, meal) => {
          acc[meal.idMeal] = meal;
          return acc;
        }, {})
      );
      // Fetch full details for each meal (in parallel)
      const mealsWithDetails = await Promise.all(
        uniqueMeals.map(async meal => {
          const details = await getMealDetailsById(meal.idMeal);
          return details ? { ...meal, ...details } : meal;
        })
      );
      // Log unique categories for debugging
      const uniqueCategories = [...new Set(mealsWithDetails.map(m => m.strCategory))];
      console.log('Unique meal categories:', uniqueCategories);
      // Filter out desserts and complex meals, and only show meals that match at least 1 inventory item (not counting staples)
      const filteredMeals = mealsWithDetails.filter(meal => {
        // Exclude by category
        if (EXCLUDED_CATEGORIES.includes(meal.strCategory)) return false;
        // Exclude by keyword in name
        const nameLower = meal.strMeal.toLowerCase();
        if (EXCLUDED_KEYWORDS.some(kw => nameLower.includes(kw))) return false;
        // Only show meals that match at least 1 inventory item (not counting staples)
        // We'll check this after fetching details, but for now, allow all
        return true;
      });
      setMeals(filteredMeals);
    } catch (e) {
      setError(e.message || 'Failed to load meals');
    } finally {
      setLoading(false);
    }
  }

  async function openMealDetails(meal) {
    setDetailsLoading(true);
    setSelectedMeal(meal);
    const details = meal; // Already have details
    // Get all ingredients for the meal
    const mealIngredients = Array.from({ length: 20 })
      .map((_, i) => details[`strIngredient${i + 1}`]?.toLowerCase().trim())
      .filter(ing => ing && !STAPLES.includes(ing));
    // Get inventory names (lowercase)
    const inventoryNames = inventory.map(f => f.name.toLowerCase().trim());
    // Only show if at least 1 inventory item is in the meal (not counting staples)
    const matchesInventory = mealIngredients.some(ing => inventoryNames.includes(ing));
    if (!matchesInventory) {
      setDetailsLoading(false);
      setSelectedMeal(null);
      setMealDetails(null);
      alert('This meal does not match your inventory.');
      return;
    }
    // Filter out complex meals by equipment/technique
    const instructions = (details.strInstructions || '').toLowerCase();
    const complexKeywords = [
      'oven', 'bake', 'roast', 'grill', 'deep fry', 'broil', 'slow cooker', 'pressure cooker', 'air fryer'
    ];
    const allowedKeywords = ['pan', 'pot', 'microwave', 'stovetop', 'boil', 'fry'];
    if (complexKeywords.some(kw => instructions.includes(kw))) {
      setDetailsLoading(false);
      setSelectedMeal(null);
      setMealDetails(null);
      alert('This meal requires special equipment or techniques not suitable for a student kitchen.');
      return;
    }
    // Filter out meals that take longer than 2 hours (except marinating)
    const timeRegex = /(\d+)\s*(hour|hr|hours)/g;
    let match;
    let tooLong = false;
    while ((match = timeRegex.exec(instructions)) !== null) {
      const hours = parseInt(match[1], 10);
      const context = instructions.slice(Math.max(0, match.index - 20), match.index + 20);
      if (hours > 2 && !context.includes('marinat')) {
        tooLong = true;
        break;
      }
    }
    if (tooLong) {
      setDetailsLoading(false);
      setSelectedMeal(null);
      setMealDetails(null);
      alert('This meal takes longer than 2 hours to cook (excluding marinating).');
      return;
    }
    setMealDetails(details);
    setDetailsLoading(false);
  }

  function closeMealDetails() {
    setSelectedMeal(null);
    setMealDetails(null);
  }

  // Filter meals by selected meal type (now works because meals have strCategory)
  const filteredMeals = meals.filter(meal =>
    mealTypeFilter === 'All' || (meal.strCategory && meal.strCategory.toLowerCase() === mealTypeFilter.toLowerCase())
  );

  async function logMealToDailyLog() {
    if (!selectedMeal) return;
    setLogging(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const calories = mealDetails?.strCalories ? Number(mealDetails.strCalories) : null;
      await supabase.from('daily_log').insert({
        user_id: user.id,
        food_name: mealDetails.strMeal,
        quantity: 1,
        unit: 'meal',
        calories,
        log_date: today,
        consumed_at: now,
        meal_type: logMealType,
        notes: mealDetails.strCategory ? `Category: ${mealDetails.strCategory}` : null,
      });
      setLogModalVisible(false);
      setSelectedMeal(null);
      setMealDetails(null);
      alert('Meal logged!');
    } catch (e) {
      alert('Failed to log meal: ' + (e.message || e));
    } finally {
      setLogging(false);
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#205081" /><Text>Loading meal recommendations...</Text></View>;
  }
  if (error) {
    return <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <Text style={styles.title}>Meal Recommendations</Text>
      {/* Meal Type Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}>
        {MEAL_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, mealTypeFilter === type && styles.filterChipSelected]}
            onPress={() => setMealTypeFilter(type)}
          >
            <Text style={[styles.filterChipText, mealTypeFilter === type && styles.filterChipTextSelected]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filteredMeals}
        keyExtractor={item => item.idMeal}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.mealCard} onPress={() => openMealDetails(item)}>
            <Image source={{ uri: item.strMealThumb }} style={styles.mealImg} />
            <Text style={styles.mealName}>{item.strMeal}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No meals found for your inventory.</Text>}
      />
      {/* Meal Details Modal */}
      <Modal visible={!!selectedMeal} animationType="slide" onRequestClose={closeMealDetails}>
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 24 }}>
          {detailsLoading || !mealDetails ? (
            <ActivityIndicator size="large" color="#205081" />
          ) : (
            <>
              <Text style={styles.detailTitle}>{mealDetails.strMeal}</Text>
              <Image source={{ uri: mealDetails.strMealThumb }} style={styles.detailImg} />
              <Text style={styles.detailSection}>Ingredients:</Text>
              {Array.from({ length: 20 }).map((_, i) => {
                const ing = mealDetails[`strIngredient${i + 1}`];
                const measure = mealDetails[`strMeasure${i + 1}`];
                if (ing && ing.trim()) {
                  return <Text key={i} style={styles.ingredient}>{measure} {ing}</Text>;
                }
                return null;
              })}
              <Text style={styles.detailSection}>Instructions:</Text>
              <Text style={styles.instructions}>{mealDetails.strInstructions}</Text>
              {/* Log this meal button */}
              <TouchableOpacity style={styles.logMealBtn} onPress={() => setLogModalVisible(true)}>
                <Text style={styles.logMealBtnText}>Log this meal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={closeMealDetails}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
        {/* Log Meal Type Modal */}
        <Modal visible={logModalVisible} transparent animationType="fade" onRequestClose={() => setLogModalVisible(false)}>
          <View style={styles.logModalOverlay}>
            <View style={styles.logModalContent}>
              <Text style={styles.logModalTitle}>Select Meal Type</Text>
              {MEAL_TYPES.filter(t => t !== 'All').map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.logTypeBtn, logMealType === type && styles.logTypeBtnSelected]}
                  onPress={() => setLogMealType(type)}
                >
                  <Text style={[styles.logTypeBtnText, logMealType === type && styles.logTypeBtnTextSelected]}>{type}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.logConfirmBtn} onPress={logMealToDailyLog} disabled={logging}>
                <Text style={styles.logConfirmBtnText}>{logging ? 'Logging...' : 'Confirm'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logCancelBtn} onPress={() => setLogModalVisible(false)}>
                <Text style={styles.logCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: 'bold', color: '#205081', marginTop: 32, marginBottom: 16, textAlign: 'center' },
  mealCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  mealImg: { width: 120, height: 120, borderRadius: 12, marginBottom: 10 },
  mealName: { fontSize: 18, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 32, fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  detailTitle: { fontSize: 26, fontWeight: 'bold', color: '#205081', marginBottom: 12, textAlign: 'center' },
  detailImg: { width: '100%', height: 220, borderRadius: 16, marginBottom: 18 },
  detailSection: { fontSize: 18, fontWeight: 'bold', color: '#205081', marginTop: 18, marginBottom: 6 },
  ingredient: { fontSize: 16, color: '#333', marginBottom: 2 },
  instructions: { fontSize: 15, color: '#444', marginTop: 8, marginBottom: 24 },
  closeBtn: { backgroundColor: '#205081', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28, alignSelf: 'center', marginTop: 16 },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  filterRow: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginRight: 8,
    minHeight: 32,
  },
  filterChipSelected: {
    backgroundColor: '#205081',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginRight: 8,
    minHeight: 32,
  },
  filterChipText: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  filterChipTextSelected: { color: '#fff' },
  logMealBtn: { backgroundColor: '#205081', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28, alignSelf: 'center', marginTop: 16 },
  logMealBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  logModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  logModalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center' },
  logModalTitle: { fontSize: 26, fontWeight: 'bold', color: '#205081', marginBottom: 12, textAlign: 'center' },
  logTypeBtn: { backgroundColor: '#f0f0f0', borderRadius: 16, padding: 8, marginRight: 8 },
  logTypeBtnSelected: { backgroundColor: '#205081', borderRadius: 16, padding: 8, marginRight: 8 },
  logTypeBtnText: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  logTypeBtnTextSelected: { color: '#fff' },
  logConfirmBtn: { backgroundColor: '#205081', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28, alignSelf: 'center', marginTop: 16 },
  logConfirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  logCancelBtn: { backgroundColor: '#f0f0f0', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28, alignSelf: 'center', marginTop: 16 },
  logCancelBtnText: { color: '#222', fontWeight: 'bold', fontSize: 18 },
}); 