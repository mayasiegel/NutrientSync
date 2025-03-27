import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from '../styles/home';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;

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

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [currentField, setCurrentField] = useState(null);

  // Activity levels
  const activityLevels = [
    'Sedentary',
    'Lightly Active',
    'Moderately Active',
    'Very Active',
    'Extra Active'
  ];

  // Sports list (can be expanded)
  const sports = [
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

  // Calculate BMI
  const calculateBMI = (weight, height) => {
    if (weight && height) {
      // Convert height from cm to meters
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setUserData(prev => ({
        ...prev,
        bmi: bmi
      }));
    }
  };

  // Handle field updates
  const updateField = (field, value) => {
    setUserData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Recalculate BMI if weight or height changes
      if (field === 'weight' || field === 'height') {
        if (field === 'weight') {
          calculateBMI(value, newData.height);
        } else {
          calculateBMI(newData.weight, value);
        }
      }
      
      return newData;
    });
  };

  // Render modal content based on field type
  const renderModalContent = () => {
    switch (currentField) {
      case 'gender':
        return (
          <Picker
            selectedValue={userData.gender}
            onValueChange={(value) => updateField('gender', value)}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        );
      case 'sport':
        return (
          <Picker
            selectedValue={userData.sport}
            onValueChange={(value) => updateField('sport', value)}
          >
            <Picker.Item label="Select Sport" value="" />
            {sports.map(sport => (
              <Picker.Item key={sport} label={sport} value={sport.toLowerCase()} />
            ))}
          </Picker>
        );
      case 'activityLevel':
        return (
          <Picker
            selectedValue={userData.activityLevel}
            onValueChange={(value) => updateField('activityLevel', value)}
          >
            <Picker.Item label="Select Activity Level" value="" />
            {activityLevels.map(level => (
              <Picker.Item key={level} label={level} value={level.toLowerCase()} />
            ))}
          </Picker>
        );
      default:
        return (
          <TextInput
            style={modalStyles.input}
            value={userData[currentField]}
            onChangeText={(value) => updateField(currentField, value)}
            keyboardType="numeric"
            placeholder={`Enter your ${currentField}`}
          />
        );
    }
  };

  const renderStatusButton = (field, label) => (
    <TouchableOpacity
      style={[
        modalStyles.statusButton,
        userData[field] ? modalStyles.statusButtonFilled : null
      ]}
      onPress={() => {
        setCurrentField(field);
        setShowModal(true);
      }}
    >
      <Text style={modalStyles.statusButtonLabel}>{label}</Text>
      <Text style={modalStyles.statusButtonValue}>
        {userData[field] || 'Not set'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.appName}>NutrientSync</Text>
          <Text style={styles.tagline}>Your personal nutrition assistant</Text>
        </View>
        
        <View style={styles.authContainer}>
          <TouchableOpacity 
            style={styles.authButton} 
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.authButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.authButton, styles.loginButton]} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Inventory')}
          >
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/inventory-icon.png')} 
                style={styles.featureIcon}
                // If you don't have this image, replace with any icon or remove
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Food Inventory</Text>
              <Text style={styles.featureDescription}>
                Track your food items, expiration dates, and nutritional information
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Meals')}
          >
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/meals-icon.png')} 
                style={styles.featureIcon}
                // If you don't have this image, replace with any icon or remove
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Meal Planning</Text>
              <Text style={styles.featureDescription}>
                Plan your meals and track your nutritional intake
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Recipes')}
          >
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/recipes-icon.png')} 
                style={styles.featureIcon}
                // If you don't have this image, replace with any icon or remove
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Recipe Suggestions</Text>
              <Text style={styles.featureDescription}>
                Get recipe ideas based on your available ingredients
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/profile-icon.png')} 
                style={styles.featureIcon}
                // If you don't have this image, replace with any icon or remove
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Profile & Preferences</Text>
              <Text style={styles.featureDescription}>
                Customize your nutrition goals and dietary preferences
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2023 NutrientSync</Text>
        </View>
      </ScrollView>

      {/* Current Status Section */}
      <View style={modalStyles.statusSection}>
        <Text style={modalStyles.statusTitle}>Current Status</Text>
        <View style={modalStyles.statusGrid}>
          {renderStatusButton('gender', 'Gender')}
          {renderStatusButton('weight', 'Weight (kg)')}
          {renderStatusButton('height', 'Height (cm)')}
          {renderStatusButton('bmi', 'BMI')}
          {renderStatusButton('sport', 'Sport')}
          {renderStatusButton('activityLevel', 'Activity Level')}
        </View>
      </View>

      {/* Modal for input */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>
              {currentField ? `Enter your ${currentField.replace(/([A-Z])/g, ' $1').toLowerCase()}` : ''}
            </Text>
            {renderModalContent()}
            <TouchableOpacity
              style={modalStyles.modalButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={modalStyles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const modalStyles = StyleSheet.create({
  statusSection: {
    padding: 20,
    backgroundColor: COLORS.background,
  },
  statusTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.text,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusButton: {
    width: '48%',
    backgroundColor: COLORS.whiteSmoke,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.glaucous,
  },
  statusButtonFilled: {
    backgroundColor: COLORS.glaucous,
  },
  statusButtonLabel: {
    fontSize: SIZES.small,
    color: COLORS.text,
    marginBottom: 5,
  },
  statusButtonValue: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.glaucous,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.whiteSmoke,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

