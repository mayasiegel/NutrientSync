import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Pressable, TextInput } from 'react-native';

const SPORTS = ['None', 'Basketball', 'Soccer', 'Swimming', 'Running', 'Tennis'];
const GENDERS = ['Woman', 'Man', 'Prefer Not to Say'];
const ACTIVITIES = ['Sedentary', 'Lightly Active', 'Active'];

export default function HomeScreen() {
  const [sportModalVisible, setSportModalVisible] = useState(false);
  const [selectedSport, setSelectedSport] = useState('Tap to set');
  const [modal, setModal] = useState(null);
  const [selectedGender, setSelectedGender] = useState('Tap to set');
  const [selectedActivity, setSelectedActivity] = useState('Tap to set');
  const [weight, setWeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [bmi, setBmi] = useState('');

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
      {/* Profile Section */}
      <Text style={styles.sectionTitle}>Your Profile</Text>
      <View style={styles.profileGrid}>
        <TouchableOpacity style={styles.profileCard} onPress={() => setModal('gender')}>
          <Text style={styles.profileLabel}>Gender</Text>
          <Text style={selectedGender === 'Tap to set' ? styles.profileValueNotBold : styles.profileValue}>{selectedGender}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileCard} onPress={() => setModal('weight')}>
          <Text style={styles.profileLabel}>Weight</Text>
          <Text style={weight === '' ? styles.profileValueNotBold : styles.profileValue}>{weight === '' ? 'Tap to set' : weight + ' lbs'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileCard} onPress={() => setModal('height')}>
          <Text style={styles.profileLabel}>Height</Text>
          <Text style={heightFeet === '' && heightInches === '' ? styles.profileValueNotBold : styles.profileValue}>{heightFeet === '' && heightInches === '' ? 'Tap to set' : `${heightFeet}' ${heightInches}"`}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileCard} onPress={() => setModal('bmi')}>
          <Text style={styles.profileLabel}>BMI</Text>
          <Text style={bmi === '' ? styles.profileValueNotBold : styles.profileValue}>{bmi === '' ? 'Tap to set' : bmi}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileCard} onPress={() => setSportModalVisible(true)}>
          <Text style={styles.profileLabel}>Sport</Text>
          <Text style={selectedSport === 'Tap to set' ? styles.profileValueNotBold : styles.profileValue}>{selectedSport}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileCard} onPress={() => setModal('activity')}>
          <Text style={styles.profileLabel}>Activity</Text>
          <Text style={selectedActivity === 'Tap to set' ? styles.profileValueNotBold : styles.profileValue}>{selectedActivity}</Text>
        </TouchableOpacity>
      </View>

      {/* Gender Modal */}
      <Modal
        visible={modal === 'gender'}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sportModalContent}>
            <Text style={styles.sportModalTitle}>Select Gender</Text>
            {GENDERS.map((gender) => (
              <Pressable
                key={gender}
                style={styles.sportOption}
                onPress={() => {
                  setSelectedGender(gender);
                  setModal(null);
                }}
              >
                <Text style={styles.sportOptionText}>{gender}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.sportCancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.sportCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Weight Modal */}
      <Modal
        visible={modal === 'weight'}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.placeholderModalContent}>
            <Text style={styles.placeholderModalTitle}>Set Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter weight"
              maxLength={4}
            />
            <Pressable style={styles.sportCancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.sportCancelText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Height Modal */}
      <Modal
        visible={modal === 'height'}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.placeholderModalContent}>
            <Text style={styles.placeholderModalTitle}>Set Height</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <TextInput
                style={[styles.input, { width: 40, marginRight: 8 }]}
                keyboardType="numeric"
                value={heightFeet}
                onChangeText={setHeightFeet}
                placeholder="ft"
                maxLength={1}
              />
              <Text style={{ fontSize: 18, marginRight: 8 }}>'</Text>
              <TextInput
                style={[styles.input, { width: 40, marginRight: 8 }]}
                keyboardType="numeric"
                value={heightInches}
                onChangeText={setHeightInches}
                placeholder="in"
                maxLength={2}
              />
              <Text style={{ fontSize: 18 }}>",</Text>
            </View>
            <Pressable style={styles.sportCancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.sportCancelText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* BMI Modal */}
      <Modal
        visible={modal === 'bmi'}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.placeholderModalContent}>
            <Text style={styles.placeholderModalTitle}>Set BMI</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={bmi}
              onChangeText={setBmi}
              placeholder="Enter BMI"
              maxLength={5}
            />
            <Pressable style={styles.sportCancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.sportCancelText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Sport Modal */}
      <Modal
        visible={sportModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sportModalContent}>
            <Text style={styles.sportModalTitle}>Select Sport</Text>
            {SPORTS.map((sport) => (
              <Pressable
                key={sport}
                style={styles.sportOption}
                onPress={() => {
                  setSelectedSport(sport);
                  setSportModalVisible(false);
                }}
              >
                <Text style={styles.sportOptionText}>{sport}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.sportCancelBtn} onPress={() => setSportModalVisible(false)}>
              <Text style={styles.sportCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Activity Modal */}
      <Modal
        visible={modal === 'activity'}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sportModalContent}>
            <Text style={styles.sportModalTitle}>Select Activity</Text>
            {ACTIVITIES.map((activity) => (
              <Pressable
                key={activity}
                style={styles.sportOption}
                onPress={() => {
                  setSelectedActivity(activity);
                  setModal(null);
                }}
              >
                <Text style={styles.sportOptionText}>{activity}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.sportCancelBtn} onPress={() => setModal(null)}>
              <Text style={styles.sportCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 32,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '47%',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileLabel: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  profileValueNotBold: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'normal',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    marginBottom: 12,
    width: 100,
    textAlign: 'center',
    backgroundColor: '#fafafa',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sportModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  sportModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222a7a',
    marginBottom: 16,
  },
  sportOption: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sportOptionText: {
    fontSize: 18,
    color: '#222',
  },
  sportCancelBtn: {
    marginTop: 16,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sportCancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  placeholderModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  placeholderModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
}); 