import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen({ route }) {
  const { session } = route.params;
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
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
    activity_level: ''
  });

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
        });
      }
    }
    fetchProfile();
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
      <View style={styles.iconRow}>
        <View style={styles.iconCol}><Text style={{ fontSize: 28 }}>🎯</Text><Text style={styles.iconLabel}>Goals</Text></View>
        <View style={styles.iconCol}><Text style={{ fontSize: 28 }}>📊</Text><Text style={styles.iconLabel}>Progress</Text></View>
        <View style={styles.iconCol}><Text style={{ fontSize: 28 }}>⚙️</Text><Text style={styles.iconLabel}>Settings</Text></View>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>👱 Personal Information</Text>
          <TouchableOpacity onPress={() => setEditing(editing === 'personal' ? false : 'personal')}>
            <Text style={styles.editBtn}>{editing === 'personal' ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
        {editing === 'personal' ? (
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
  iconRow: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 12 },
  iconCol: { alignItems: 'center', flex: 1 },
  iconLabel: { fontSize: 15, color: '#555', marginTop: 4 },
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
}); 