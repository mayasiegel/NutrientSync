import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.headerSection}>
        <Image source={{ uri: 'https://www.w3schools.com/howto/img_avatar.png' }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
        </View>
      </View>
      <View style={styles.loginRow}>
        <TouchableOpacity style={styles.loginBtn}><Text style={styles.loginBtnText}>Login</Text></TouchableOpacity>
        <TouchableOpacity style={styles.loginBtn}><Text style={styles.loginBtnText}>Sign Up</Text></TouchableOpacity>
      </View>
      <View style={styles.iconRow}>
        <View style={styles.iconCol}><Text style={{ fontSize: 28 }}>🎯</Text><Text style={styles.iconLabel}>Goals</Text></View>
        <View style={styles.iconCol}><Text style={{ fontSize: 28 }}>📊</Text><Text style={styles.iconLabel}>Progress</Text></View>
        <View style={styles.iconCol}><Text style={{ fontSize: 28 }}>⚙️</Text><Text style={styles.iconLabel}>Settings</Text></View>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>👱 Personal Information</Text>
          <TouchableOpacity><Text style={styles.editBtn}>Edit</Text></TouchableOpacity>
        </View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Age</Text><Text style={styles.infoValue}>30</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Location</Text><Text style={styles.infoValue}>New York</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Member Since</Text><Text style={styles.infoValue}>Jan 2023</Text></View>
      </View>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🌱 Preferences</Text>
          <TouchableOpacity><Text style={styles.editBtn}>Edit</Text></TouchableOpacity>
        </View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Diet</Text><Text style={styles.infoValue}>Vegetarian</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Allergies</Text><Text style={styles.infoValue}>None</Text></View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', paddingBottom: 24 },
  headerSection: { flexDirection: 'row', alignItems: 'center', marginTop: 32, marginBottom: 8, marginLeft: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 16, backgroundColor: '#eee' },
  name: { fontSize: 28, fontWeight: 'bold', color: '#222' },
  email: { fontSize: 16, color: '#555', marginTop: 2 },
  loginRow: { flexDirection: 'row', justifyContent: 'flex-start', marginLeft: 16, marginBottom: 12 },
  loginBtn: { backgroundColor: '#4A90E2', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 24, marginRight: 12 },
  loginBtnText: { color: '#fff', fontWeight: '400', fontSize: 16 },
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  statsCol: { flex: 1, alignItems: 'center' },
  statsValue: { fontSize: 22, fontWeight: 'bold', color: '#205081' },
  statsLabel: { fontSize: 15, color: '#555', marginTop: 2 },
}); 