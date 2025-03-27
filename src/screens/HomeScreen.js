import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Pressable
} from 'react-native';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;

const GENDER_OPTIONS = ['Man', 'Woman', 'Prefer not to say'];
const ACTIVITY_LEVELS = ['Active', 'Moderate', 'Sedentary'];
const SPORTS = [
  'None',
  'Basketball',
  'Soccer',
  'Swimming',
  'Running',
  'Tennis',
  'Volleyball',
  'Weightlifting',
  'CrossFit',
  'Other'
];

const HomeScreen = ({ navigation }) => {
  // User data state
  const [userData, setUserData] = useState({
    gender: '',
    weight: '',
    height: '',
    bmi: '',
    sport: '',
    activityLevel: ''
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [tempHeight, setTempHeight] = useState({ feet: '', inches: '' });

  const openModal = (field) => {
    setCurrentField(field);
    setModalVisible(true);
  };

  const handleSave = (value) => {
    if (currentField === 'height') {
      const heightStr = `${tempHeight.feet}'${tempHeight.inches}"`;
      setUserData(prev => ({ ...prev, [currentField]: heightStr }));
    } else {
      setUserData(prev => ({ ...prev, [currentField]: value }));
    }
    setModalVisible(false);
  };

  const renderModalContent = () => {
    switch (currentField) {
      case 'gender':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => handleSave(option)}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'weight':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Weight (lbs)</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Enter weight"
              value={userData.weight}
              onChangeText={(text) => setUserData(prev => ({ ...prev, weight: text }))}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSave(userData.weight)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        );

      case 'height':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Height</Text>
            <View style={styles.heightInputContainer}>
              <TextInput
                style={[styles.modalInput, styles.heightInput]}
                keyboardType="numeric"
                placeholder="Feet"
                value={tempHeight.feet}
                onChangeText={(text) => setTempHeight(prev => ({ ...prev, feet: text }))}
              />
              <Text style={styles.heightSeparator}>'</Text>
              <TextInput
                style={[styles.modalInput, styles.heightInput]}
                keyboardType="numeric"
                placeholder="Inches"
                value={tempHeight.inches}
                onChangeText={(text) => setTempHeight(prev => ({ ...prev, inches: text }))}
              />
              <Text style={styles.heightSeparator}>"</Text>
            </View>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSave(`${tempHeight.feet}'${tempHeight.inches}"`)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        );

      case 'bmi':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter BMI</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="Enter BMI"
              value={userData.bmi}
              onChangeText={(text) => setUserData(prev => ({ ...prev, bmi: text }))}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSave(userData.bmi)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        );

      case 'sport':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Sport</Text>
            <ScrollView style={styles.modalScrollView}>
              {SPORTS.map((sport) => (
                <TouchableOpacity
                  key={sport}
                  style={styles.modalOption}
                  onPress={() => handleSave(sport)}
                >
                  <Text style={styles.modalOptionText}>{sport}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 'activityLevel':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Activity Level</Text>
            {ACTIVITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={styles.modalOption}
                onPress={() => handleSave(level)}
              >
                <Text style={styles.modalOptionText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>NutrientSync</Text>
          <Text style={styles.subtitle}>Your personal nutrition assistant</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrient Summary</Text>
          <View style={styles.card}>
            <Text>Your daily nutrient progress will appear here</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Intake</Text>
          <View style={styles.card}>
            <Text>Track your meals and nutrients here</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expiring Soon</Text>
          <View style={styles.card}>
            <Text>Food items nearing expiration will appear here</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Status</Text>
          <View style={styles.statusGrid}>
            <TouchableOpacity 
              style={styles.statusButton}
              onPress={() => openModal('gender')}
            >
              <Text style={styles.statusLabel}>Gender</Text>
              <Text style={styles.statusValue}>{userData.gender || 'Tap to set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statusButton}
              onPress={() => openModal('weight')}
            >
              <Text style={styles.statusLabel}>Weight (lbs)</Text>
              <Text style={styles.statusValue}>{userData.weight || 'Tap to set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statusButton}
              onPress={() => openModal('height')}
            >
              <Text style={styles.statusLabel}>Height</Text>
              <Text style={styles.statusValue}>{userData.height || 'Tap to set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statusButton}
              onPress={() => openModal('bmi')}
            >
              <Text style={styles.statusLabel}>BMI</Text>
              <Text style={styles.statusValue}>{userData.bmi || 'Tap to set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statusButton}
              onPress={() => openModal('sport')}
            >
              <Text style={styles.statusLabel}>Sport</Text>
              <Text style={styles.statusValue}>{userData.sport || 'Tap to set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statusButton}
              onPress={() => openModal('activityLevel')}
            >
              <Text style={styles.statusLabel}>Activity Level</Text>
              <Text style={styles.statusValue}>{userData.activityLevel || 'Tap to set'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalView}>
            {renderModalContent()}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.background,
    marginBottom: 10,
  },
  title: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.glaucous,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.glaucous,
  },
  statusLabel: {
    fontSize: SIZES.small,
    color: COLORS.text,
    marginBottom: 5,
  },
  statusValue: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },
  modalOption: {
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glaucous,
  },
  modalOptionText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.glaucous,
    borderRadius: 8,
    padding: 10,
    fontSize: SIZES.medium,
    marginBottom: 20,
  },
  heightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heightInput: {
    width: 80,
    marginHorizontal: 5,
  },
  heightSeparator: {
    fontSize: SIZES.large,
    color: COLORS.text,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    width: '100%',
  },
  closeButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    width: '100%',
  },
  saveButtonText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  modalScrollView: {
    maxHeight: 300,
    width: '100%',
  },
});

export default HomeScreen;

