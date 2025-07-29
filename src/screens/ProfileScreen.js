import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { supabase } from '../lib/supabase';
import { getCurrentSeason, getSeasonDescription } from '../lib/sportSeasons';
import budgetService from '../services/budgetService';

const GOALS = ['Gain Weight', 'Lose Weight', 'Maintain Weight', 'Build Muscle', 'Improve Performance'];

export default function ProfileScreen({ route }) {
  const { session } = route.params;
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [budget, setBudget] = useState(null);
  const [budgetSpending, setBudgetSpending] = useState(null);
  const [form, setForm] = useState({ 
    username: '', 
    age: '', 
    location: '', 
    diet: '', 
    allergies: '',
    gender: '',
    weight_lbs: '',
    height_feet: '',
    height_inches: '',
    sport: '',
    activity_level: '',
    goal: '',
    season: ''
  });
  const [budgetForm, setBudgetForm] = useState({
    monthly_budget: ''
  });
  const [goalModal, setGoalModal] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (error) Alert.alert('Error', error.message);
      else {
        setProfile(data);
        setForm({
          username: data?.username || '',
          age: data?.age || '',
          location: data?.location || '',
          diet: data?.diet || '',
          allergies: data?.allergies || '',
          gender: data?.gender || '',
          weight_lbs: data?.weight_lbs ? data.weight_lbs.toString() : '',
          height_feet: data?.height_feet ? data.height_feet.toString() : '',
          height_inches: data?.height_inches ? data.height_inches.toString() : '',
          sport: data?.sport || '',
          activity_level: data?.activity_level || '',
          goal: data?.goal || '',
          season: data?.season || '',
        });
      }
    }
    
    async function fetchBudget() {
      try {
        const budgetData = await budgetService.getCurrentMonthBudget(session.user.id);
        if (budgetData) {
          setBudget(budgetData);
          setBudgetForm({ monthly_budget: budgetData.monthly_budget.toString() });
          
          // Get spending data
          const spendingData = await budgetService.getMonthlySpending(session.user.id);
          if (spendingData) {
            setBudgetSpending(spendingData);
          }
        }
      } catch (error) {
        console.error('Error fetching budget:', error);
      }
    }
    
    fetchProfile();
    fetchBudget();
  }, [session.user.id]);

  async function handleSave() {
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      ...form,
      weight_lbs: form.weight_lbs ? parseFloat(form.weight_lbs) : null,
      height_feet: form.height_feet ? parseInt(form.height_feet) : null,
      height_inches: form.height_inches ? parseInt(form.height_inches) : null,
      updated_at: new Date(),
    });
    if (error) Alert.alert('Error', error.message);
    else {
      setProfile({ ...profile, ...form });
      setEditing(false);
      Alert.alert('Profile updated!');
    }
  }

  async function handleBudgetSave() {
    if (!budgetForm.monthly_budget || parseFloat(budgetForm.monthly_budget) <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    try {
      const data = await budgetService.setMonthlyBudget(session.user.id, budgetForm.monthly_budget);
      setBudget(data);
      setEditing(false);
      Alert.alert('Budget updated!');
      
      // Refresh spending data
      const spendingData = await budgetService.getMonthlySpending(session.user.id);
      if (spendingData) {
        setBudgetSpending(spendingData);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  function getBudgetStatusColor(percentage) {
    if (percentage >= 100) return '#e74c3c'; // Red for over budget
    if (percentage >= 80) return '#f39c12'; // Orange for warning
    return '#27ae60'; // Green for good
  }

  function getBudgetStatusText(percentage) {
    if (percentage >= 100) return 'Over Budget';
    if (percentage >= 80) return 'Warning';
    return 'On Track';
  }

  if (!profile) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerSection}>
        <Image source={{ uri: 'https://www.w3schools.com/howto/img_avatar.png' }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile.username || 'Your Name'}</Text>
          <Text style={styles.email}>{session.user.email}</Text>
        </View>
      </View>
      <View style={styles.streakCard}>
        <Text style={styles.streakFire}>🔥</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.streakCardText}>
            {profile.current_streak > 0
              ? `${profile.current_streak}-day streak! (Longest: ${profile.longest_streak})`
              : 'No streak yet'}
          </Text>
        </View>
      </View>

      {/* Budget Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>💰 Monthly Budget</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => setEditing(editing === 'budget' ? false : 'budget')}>
              <Text style={styles.editBtn}>{editing === 'budget' ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={async () => {
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  await budgetService.addMockTransactions(user.id);
                  Alert.alert('Success', 'Added test transactions! Check your budget status.');
                  fetchBudget(); // Refresh budget data
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to add test transactions');
              }
            }}>
              <Text style={[styles.editBtn, { color: '#27ae60' }]}>Add Test Data</Text>
            </TouchableOpacity>
          </View>
        </View>
        {editing === 'budget' ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Monthly Budget</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Text style={{ marginRight: 8 }}>$</Text>
                <TextInput
                  style={[styles.inputInline, { flex: 1 }]}
                  value={budgetForm.monthly_budget}
                  onChangeText={v => setBudgetForm(f => ({ ...f, monthly_budget: v }))}
                  placeholder="500"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleBudgetSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {budget ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Monthly Budget</Text>
                  <Text style={styles.infoValue}>${budget.monthly_budget}</Text>
                </View>
                {budgetSpending && (
                  <>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Spent This Month</Text>
                      <Text style={styles.infoValue}>${budgetSpending.total_spent}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Remaining</Text>
                      <Text style={[styles.infoValue, { color: getBudgetStatusColor(budgetSpending.percentage_used) }]}>
                        ${budgetSpending.budget_remaining}
                      </Text>
                    </View>
                    <View style={styles.budgetProgressContainer}>
                      <View style={styles.budgetProgressBar}>
                        <View 
                          style={[
                            styles.budgetProgressFill, 
                            { 
                              width: `${Math.min(budgetSpending.percentage_used, 100)}%`,
                              backgroundColor: getBudgetStatusColor(budgetSpending.percentage_used)
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.budgetStatusText, { color: getBudgetStatusColor(budgetSpending.percentage_used) }]}>
                        {getBudgetStatusText(budgetSpending.percentage_used)} ({budgetSpending.percentage_used}%)
                      </Text>
                    </View>
                  </>
                )}
              </>
            ) : (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Monthly Budget</Text>
                <Text style={styles.infoValue}>Not set</Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🎯 Goals & Season</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'goals' ? false : 'goals')}>
            <Text style={styles.editBtn}>{editing === 'goals' ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
        {editing === 'goals' ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nutrition Goal</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setGoalModal(true)}
              >
                <Text style={form.goal ? styles.selectorText : styles.selectorPlaceholder}>
                  {form.goal || 'Select your goal'}
                </Text>
              </TouchableOpacity>
            </View>
            <Modal visible={goalModal} animationType="slide" transparent>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select Nutrition Goal</Text>
                  {GOALS.map((g) => (
                    <Pressable
                      key={g}
                      style={styles.modalOption}
                      onPress={() => {
                        setForm(f => ({ ...f, goal: g }));
                        setGoalModal(false);
                      }}
                    >
                      <Text style={styles.modalOptionText}>{g}</Text>
                    </Pressable>
                  ))}
                  <Pressable style={styles.modalCancelBtn} onPress={() => setGoalModal(false)}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Season</Text>
              <TextInput
                style={styles.inputInline}
                value={form.season}
                onChangeText={v => setForm(f => ({ ...f, season: v }))}
                placeholder="e.g., Inseason, Offseason"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nutrition Goal</Text>
              <Text style={styles.infoValue}>{profile.goal || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Season</Text>
              <Text style={styles.infoValue}>{profile.season || 'Not set'}</Text>
            </View>
            {profile.sport && profile.sport !== 'None' && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sport Season</Text>
                <Text style={styles.infoValue}>{getSeasonDescription(profile.sport)}</Text>
              </View>
            )}
          </>
        )}
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>👤 Basic Info</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'basic' ? false : 'basic')}>
            <Text style={styles.editBtn}>{editing === 'basic' ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
        {editing === 'basic' ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name</Text>
              <TextInput
                style={styles.inputInline}
                value={form.username}
                onChangeText={v => setForm(f => ({ ...f, username: v }))}
                placeholder="Name"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age</Text>
              <TextInput
                style={styles.inputInline}
                value={form.age}
                onChangeText={v => setForm(f => ({ ...f, age: v }))}
                placeholder="Age"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <TextInput
                style={styles.inputInline}
                value={form.location}
                onChangeText={v => setForm(f => ({ ...f, location: v }))}
                placeholder="Location"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>{profile.username || 'N/A'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Age</Text><Text style={styles.infoValue}>{profile.age || 'N/A'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Location</Text><Text style={styles.infoValue}>{profile.location || 'N/A'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Member Since</Text><Text style={styles.infoValue}>Jan 2023</Text></View>
          </>
        )}
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>💪 Health & Activity</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'health' ? false : 'health')}>
            <Text style={styles.editBtn}>{editing === 'health' ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
        {editing === 'health' ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <TextInput
                style={styles.inputInline}
                value={form.gender}
                onChangeText={v => setForm(f => ({ ...f, gender: v }))}
                placeholder="Gender"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.inputInline}
                value={form.weight_lbs}
                onChangeText={v => setForm(f => ({ ...f, weight_lbs: v }))}
                placeholder="Weight"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Height</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <TextInput
                  style={[styles.inputInline, { flex: 1, marginRight: 8 }]}
                  value={form.height_feet}
                  onChangeText={v => setForm(f => ({ ...f, height_feet: v }))}
                  placeholder="5"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                />
                <Text style={{ marginRight: 8 }}>ft</Text>
                <TextInput
                  style={[styles.inputInline, { flex: 1, marginRight: 8 }]}
                  value={form.height_inches}
                  onChangeText={v => setForm(f => ({ ...f, height_inches: v }))}
                  placeholder="10"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                />
                <Text>in</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sport</Text>
              <TextInput
                style={styles.inputInline}
                value={form.sport}
                onChangeText={v => setForm(f => ({ ...f, sport: v }))}
                placeholder="Sport"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Activity Level</Text>
              <TextInput
                style={styles.inputInline}
                value={form.activity_level}
                onChangeText={v => setForm(f => ({ ...f, activity_level: v }))}
                placeholder="Activity Level"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Gender</Text><Text style={styles.infoValue}>{profile.gender || 'N/A'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Weight</Text><Text style={styles.infoValue}>{profile.weight_lbs ? `${profile.weight_lbs} lbs` : 'N/A'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Height</Text><Text style={styles.infoValue}>{profile.height_feet && profile.height_inches ? `${profile.height_feet}' ${profile.height_inches}"` : 'N/A'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>BMI</Text><Text style={styles.infoValue}>{profile.bmi || 'N/A'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Sport</Text><Text style={styles.infoValue}>{profile.sport || 'N/A'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Activity Level</Text><Text style={styles.infoValue}>{profile.activity_level || 'N/A'}</Text></View>
          </>
        )}
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🌱 Preferences</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'prefs' ? false : 'prefs')}>
            <Text style={styles.editBtn}>{editing === 'prefs' ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
        {editing === 'prefs' ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Diet</Text>
              <TextInput
                style={styles.inputInline}
                value={form.diet}
                onChangeText={v => setForm(f => ({ ...f, diet: v }))}
                placeholder="Diet"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Allergies</Text>
              <TextInput
                style={styles.inputInline}
                value={form.allergies}
                onChangeText={v => setForm(f => ({ ...f, allergies: v }))}
                placeholder="Allergies"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Diet</Text><Text style={styles.infoValue}>{profile.diet || 'N/A'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Allergies</Text><Text style={styles.infoValue}>{profile.allergies || 'N/A'}</Text></View>
          </>
        )}
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📊 Statistics</Text>
          <TouchableOpacity><Text style={styles.editBtn}>View All</Text></TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statsCol}><Text style={styles.statsValue}>120</Text><Text style={styles.statsLabel}>Meals Logged</Text></View>
          <View style={styles.statsCol}><Text style={styles.statsValue}>2100</Text><Text style={styles.statsLabel}>Avg. Calories</Text></View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statsCol}><Text style={styles.statsValue}>85%</Text><Text style={styles.statsLabel}>Goal Completion</Text></View>
          <View style={styles.statsCol}><Text style={styles.statsValue}>12</Text><Text style={styles.statsLabel}>Streak Days</Text></View>
        </View>
      </View>
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <TouchableOpacity
          style={{ backgroundColor: '#e74c3c', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 }}
          onPress={() => supabase.auth.signOut()}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', paddingBottom: 24 },
  headerSection: { flexDirection: 'row', alignItems: 'center', marginTop: 32, marginBottom: 8, marginLeft: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16, backgroundColor: '#eee' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#222' },
  email: { fontSize: 16, color: '#555', marginTop: 2 },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  streakFire: { fontSize: 36, marginRight: 16 },
  streakCardText: { fontSize: 18, fontWeight: 'bold', color: '#e67e22' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  editBtn: { color: '#205081', fontWeight: '400', fontSize: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 8 },
  infoLabel: { fontSize: 16, color: '#888' },
  infoValue: { fontSize: 17, color: '#222', fontWeight: 'bold' },
  inputInline: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, fontSize: 16, backgroundColor: '#f7f7f7', marginLeft: 8 },
  saveBtn: { backgroundColor: '#205081', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18, marginLeft: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { backgroundColor: '#eee', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 18, marginLeft: 8 },
  cancelBtnText: { color: '#205081', fontWeight: 'bold', fontSize: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statsCol: { flex: 1, alignItems: 'center' },
  statsValue: { fontSize: 22, fontWeight: 'bold', color: '#205081' },
  statsLabel: { fontSize: 15, color: '#555', marginTop: 2 },
  selector: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#f7f7f7',
    marginLeft: 8,
  },
  selectorText: {
    color: '#222',
    fontWeight: 'bold',
  },
  selectorPlaceholder: {
    color: '#aaa',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
  },
  modalOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  modalCancelBtn: {
    backgroundColor: '#205081',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  modalCancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  budgetProgressContainer: {
    marginTop: 12,
  },
  budgetProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
}); 