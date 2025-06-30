import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert, ScrollView, TouchableOpacity, Pressable, Modal } from 'react-native';
import { supabase } from '../lib/supabase';
import { getCurrentSeason, getSeasonDescription, getAvailableSports } from '../lib/sportSeasons';

const GENDERS = ['Woman', 'Man', 'Prefer Not to Say'];
const SPORTS = ['None', 'Basketball', 'Soccer', 'Swimming', 'Running', 'Tennis', 'Football', 'Baseball', 'Volleyball', 'Track & Field', 'Cross Country', 'Wrestling', 'Golf', 'Lacrosse', 'Hockey'];
const ACTIVITIES = ['Sedentary', 'Lightly Active', 'Active'];
const GOALS = ['Gain Weight', 'Lose Weight', 'Maintain Weight', 'Build Muscle', 'Improve Performance'];

export default function CompleteProfile({ user, onComplete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Page 1 fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [diet, setDiet] = useState('');
  const [allergies, setAllergies] = useState('');
  
  // Page 2 fields
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [sport, setSport] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [season, setSeason] = useState('');
  
  // Modal states
  const [modal, setModal] = useState(null);

  // Auto-detect season when sport changes
  React.useEffect(() => {
    if (sport && sport !== 'None') {
      const currentSeason = getCurrentSeason(sport);
      setSeason(currentSeason);
    } else {
      setSeason('Offseason');
    }
  }, [sport]);

  function calculateBMI() {
    if (!weight || !heightFeet || !heightInches) return null;
    const heightInchesTotal = parseInt(heightFeet) * 12 + parseInt(heightInches);
    const heightMeters = heightInchesTotal * 0.0254;
    const weightKg = parseFloat(weight) * 0.453592;
    return (weightKg / (heightMeters * heightMeters)).toFixed(1);
  }

  async function handleSave() {
    console.log('handleSave called');
    console.log('Form values:', { name, age, gender, weight, heightFeet, heightInches, activityLevel, goal, season });
    
    setLoading(true);
    
    // Validate required fields with specific error messages
    const missingFields = [];
    if (!name || name.trim() === '') missingFields.push('Name');
    if (!age || age.trim() === '') missingFields.push('Age');
    if (!gender || gender.trim() === '') missingFields.push('Gender');
    if (!weight || weight.trim() === '') missingFields.push('Weight');
    if (!heightFeet || heightFeet.trim() === '') missingFields.push('Height (feet)');
    if (!heightInches || heightInches.trim() === '') missingFields.push('Height (inches)');
    if (!activityLevel || activityLevel.trim() === '') missingFields.push('Activity Level');
    if (!goal || goal.trim() === '') missingFields.push('Goal');
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      Alert.alert('Missing Information', `Please fill in: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    console.log('All validation passed, saving to database...');
    const bmi = calculateBMI();
    console.log('Calculated BMI:', bmi);
    
    const profileData = {
      id: user.id,
      username: name,
      age,
      location,
      diet,
      allergies,
      gender,
      weight_lbs: parseFloat(weight),
      height_feet: parseInt(heightFeet),
      height_inches: parseInt(heightInches),
      bmi: parseFloat(bmi),
      sport,
      activity_level: activityLevel,
      goal,
      season,
      updated_at: new Date(),
    };
    
    console.log('Profile data to save:', profileData);
    
    const { error } = await supabase.from('profiles').upsert(profileData);
    
    console.log('Supabase response:', { error });
    
    setLoading(false);
    if (error) {
      console.error('Supabase error:', error);
      Alert.alert('Error', error.message);
    } else {
      console.log('Profile saved successfully, calling onComplete');
      onComplete();
    }
  }

  function renderPage1() {
    return (
      <ScrollView style={styles.pageContainer}>
        <Text style={styles.title}>Basic Information</Text>
        <Text style={styles.subtitle}>Tell us about yourself</Text>
        
        <Text style={styles.label}>Name *</Text>
        <TextInput 
          placeholder="Your name" 
          value={name} 
          onChangeText={setName} 
          style={styles.input} 
        />
        
        <Text style={styles.label}>Age *</Text>
        <TextInput 
          placeholder="Age" 
          value={age} 
          onChangeText={setAge} 
          style={styles.input} 
          keyboardType="numeric" 
        />
        
        <Text style={styles.label}>Location</Text>
        <TextInput 
          placeholder="City, State" 
          value={location} 
          onChangeText={setLocation} 
          style={styles.input} 
        />
        
        <Text style={styles.label}>Diet</Text>
        <TextInput 
          placeholder="e.g., Vegetarian, Keto, Mediterranean" 
          value={diet} 
          onChangeText={setDiet} 
          style={styles.input} 
        />
        
        <Text style={styles.label}>Allergies</Text>
        <TextInput 
          placeholder="e.g., Peanuts, Gluten, Dairy" 
          value={allergies} 
          onChangeText={setAllergies} 
          style={styles.input} 
        />
        
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={() => setCurrentPage(2)}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  function renderPage2() {
    return (
      <ScrollView style={styles.pageContainer}>
        <Text style={styles.title}>Health & Activity</Text>
        <Text style={styles.subtitle}>Help us calculate your nutrient needs</Text>
        
        <Text style={styles.label}>Gender *</Text>
        <TouchableOpacity 
          style={styles.selector} 
          onPress={() => setModal('gender')}
        >
          <Text style={gender ? styles.selectorText : styles.selectorPlaceholder}>
            {gender || 'Select gender'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.label}>Weight (lbs) *</Text>
        <TextInput 
          placeholder="Weight in pounds" 
          value={weight} 
          onChangeText={setWeight} 
          style={styles.input} 
          keyboardType="numeric" 
        />
        
        <Text style={styles.label}>Height *</Text>
        <View style={styles.heightContainer}>
          <TextInput 
            placeholder="5" 
            value={heightFeet} 
            onChangeText={setHeightFeet} 
            style={[styles.input, styles.heightInput]} 
            keyboardType="numeric" 
          />
          <Text style={styles.heightLabel}>ft</Text>
          <TextInput 
            placeholder="10" 
            value={heightInches} 
            onChangeText={setHeightInches} 
            style={[styles.input, styles.heightInput]} 
            keyboardType="numeric" 
          />
          <Text style={styles.heightLabel}>in</Text>
        </View>
        
        <Text style={styles.label}>Primary Sport</Text>
        <TouchableOpacity 
          style={styles.selector} 
          onPress={() => setModal('sport')}
        >
          <Text style={sport ? styles.selectorText : styles.selectorPlaceholder}>
            {sport || 'Select sport'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.label}>Activity Level *</Text>
        <TouchableOpacity 
          style={styles.selector} 
          onPress={() => setModal('activity')}
        >
          <Text style={activityLevel ? styles.selectorText : styles.selectorPlaceholder}>
            {activityLevel || 'Select activity level'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.label}>Nutrition Goal *</Text>
        <TouchableOpacity 
          style={styles.selector} 
          onPress={() => setModal('goal')}
        >
          <Text style={goal ? styles.selectorText : styles.selectorPlaceholder}>
            {goal || 'Select your goal'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.label}>Current Season</Text>
        <View style={styles.seasonContainer}>
          <Text style={styles.seasonText}>
            {sport && sport !== 'None' ? season : 'No sport selected'}
          </Text>
          {sport && sport !== 'None' && (
            <Text style={styles.seasonDescription}>
              {getSeasonDescription(sport)}
            </Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Complete Profile'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, currentPage >= 1 && styles.progressDotActive]} />
        <View style={[styles.progressLine, currentPage >= 2 && styles.progressLineActive]} />
        <View style={[styles.progressDot, currentPage >= 2 && styles.progressDotActive]} />
      </View>
      
      {currentPage === 1 ? renderPage1() : renderPage2()}
      
      {/* Gender Modal */}
      <Modal visible={modal === 'gender'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {GENDERS.map((g) => (
              <Pressable
                key={g}
                style={styles.modalOption}
                onPress={() => {
                  setGender(g);
                  setModal(null);
                }}
              >
                <Text style={styles.modalOptionText}>{g}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.modalCancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      
      {/* Sport Modal */}
      <Modal visible={modal === 'sport'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Sport</Text>
            {SPORTS.map((s) => (
              <Pressable
                key={s}
                style={styles.modalOption}
                onPress={() => {
                  setSport(s);
                  setModal(null);
                }}
              >
                <Text style={styles.modalOptionText}>{s}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.modalCancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      
      {/* Activity Modal */}
      <Modal visible={modal === 'activity'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Activity Level</Text>
            {ACTIVITIES.map((a) => (
              <Pressable
                key={a}
                style={styles.modalOption}
                onPress={() => {
                  setActivityLevel(a);
                  setModal(null);
                }}
              >
                <Text style={styles.modalOptionText}>{a}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.modalCancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      
      {/* Goal Modal */}
      <Modal visible={modal === 'goal'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Nutrition Goal</Text>
            {GOALS.map((g) => (
              <Pressable
                key={g}
                style={styles.modalOption}
                onPress={() => {
                  setGoal(g);
                  setModal(null);
                }}
              >
                <Text style={styles.modalOptionText}>{g}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.modalCancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  progressContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 20,
    paddingHorizontal: 40
  },
  progressDot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: '#ddd' 
  },
  progressDotActive: { backgroundColor: '#205081' },
  progressLine: { 
    width: 60, 
    height: 2, 
    backgroundColor: '#ddd', 
    marginHorizontal: 8 
  },
  progressLineActive: { backgroundColor: '#205081' },
  pageContainer: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 8 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  selector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fff'
  },
  selectorText: { fontSize: 16, color: '#222' },
  selectorPlaceholder: { fontSize: 16, color: '#999' },
  heightContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  heightInput: { 
    flex: 1, 
    marginRight: 8, 
    marginBottom: 0 
  },
  heightLabel: { 
    fontSize: 16, 
    color: '#666', 
    marginRight: 16 
  },
  nextButton: {
    backgroundColor: '#205081',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20
  },
  nextButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 20 
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    flex: 0.48,
    alignItems: 'center'
  },
  backButtonText: { color: '#666', fontSize: 18, fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#205081',
    borderRadius: 12,
    padding: 16,
    flex: 0.48,
    alignItems: 'center'
  },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    borderColor: '#999',
    borderWidth: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center'
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  modalOption: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalOptionText: { fontSize: 18, color: '#222' },
  modalCancelBtn: {
    marginTop: 20,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  modalCancelText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  seasonContainer: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  seasonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4
  },
  seasonDescription: {
    fontSize: 14,
    color: '#666'
  }
}); 