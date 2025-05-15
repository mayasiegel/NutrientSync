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
  Pressable,
  Dimensions
} from 'react-native';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;
const { width } = Dimensions.get('window');

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
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>NutrientSync</Text>
          <Text style={styles.subtitle}>Your personal nutrition assistant</Text>
        </View>

        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>2,450</Text>
            <Text style={styles.quickStatLabel}>Daily Calories</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>75%</Text>
            <Text style={styles.quickStatLabel}>Goal Progress</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>3</Text>
            <Text style={styles.quickStatLabel}>Meals Today</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Calories</Text>
              <Text style={styles.summaryValue}>1,840 / 2,450</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Protein</Text>
              <Text style={styles.summaryValue}>65g / 80g</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '81%' }]} />
              </View>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Carbs</Text>
              <Text style={styles.summaryValue}>220g / 300g</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '73%' }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expiring Soon</Text>
          <View style={styles.expiringCard}>
            <View style={styles.expiringItem}>
              <Text style={styles.expiringFood}>Milk</Text>
              <Text style={styles.expiringDate}>2 days left</Text>
            </View>
            <View style={styles.expiringItem}>
              <Text style={styles.expiringFood}>Yogurt</Text>
              <Text style={styles.expiringDate}>3 days left</Text>
            </View>
            <View style={styles.expiringItem}>
              <Text style={styles.expiringFood}>Chicken</Text>
              <Text style={styles.expiringDate}>1 day left</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Profile</Text>
          <View style={styles.profileGrid}>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => openModal('gender')}
            >
              <Text style={styles.profileLabel}>Gender</Text>
              <Text style={styles.profileValue}>{userData.gender || 'Tap to set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => openModal('weight')}
            >
              <Text style={styles.profileLabel}>Weight</Text>
              <Text style={styles.profileValue}>{userData.weight || 'Tap to set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => openModal('height')}
            >
              <Text style={styles.profileLabel}>Height</Text>
              <Text style={styles.profileValue}>{userData.height || 'Tap to set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => openModal('bmi')}
            >
              <Text style={styles.profileLabel}>BMI</Text>
              <Text style={styles.profileValue}>{userData.bmi || 'Tap to set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => openModal('sport')}
            >
              <Text style={styles.profileLabel}>Sport</Text>
              <Text style={styles.profileValue}>{userData.sport || 'Tap to set'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => openModal('activityLevel')}
            >
              <Text style={styles.profileLabel}>Activity</Text>
              <Text style={styles.profileValue}>{userData.activityLevel || 'Tap to set'}</Text>
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
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#636E72',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 16,
  },
  quickStatCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    width: (width - 48) / 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00B894',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 14,
    color: '#636E72',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  summaryItem: {
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#2D3436',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00B894',
    borderRadius: 4,
  },
  expiringCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  expiringItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  expiringFood: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '500',
  },
  expiringDate: {
    fontSize: 14,
    color: '#FF7675',
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileButton: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  profileLabel: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 20,
  },
  modalOption: {
    width: '100%',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#2D3436',
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
    fontSize: 20,
    color: '#2D3436',
  },
  closeButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#FF7675',
    borderRadius: 8,
    width: '100%',
  },
  closeButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#00B894',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalScrollView: {
    maxHeight: 300,
    width: '100%',
  },
});

export default HomeScreen;

