import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;
const { width } = Dimensions.get('window');

const macronutrients = {
  Protein: { amount: '46-56g', description: 'Essential for muscle growth and repair', icon: '💪' },
  Carbohydrates: { amount: '225-325g', description: 'Primary energy source', icon: '⚡' },
  Fats: { amount: '44-77g', description: 'Important for hormone production', icon: '🫧' },
  Fiber: { amount: '25-38g', description: 'Aids digestion and satiety', icon: '🌿' },
};

const micronutrients = {
  'Vitamin A': { amount: '700-900mcg', description: 'Vision and immune health', icon: '👁️' },
  'Vitamin C': { amount: '65-90mg', description: 'Antioxidant and immune support', icon: '🍊' },
  'Vitamin D': { amount: '15-20mcg', description: 'Bone health and immunity', icon: '☀️' },
  'Iron': { amount: '8-18mg', description: 'Oxygen transport in blood', icon: '🩸' },
  'Calcium': { amount: '1000mg', description: 'Bone and teeth health', icon: '🦴' },
  'Potassium': { amount: '3500-4700mg', description: 'Blood pressure regulation', icon: '🍌' },
  'Magnesium': { amount: '310-420mg', description: 'Energy production and muscle function', icon: '⚡' },
  'Zinc': { amount: '8-11mg', description: 'Immune function and wound healing', icon: '🛡️' },
};

const NutrientsScreen = () => {
  const [activeView, setActiveView] = useState('macro');
  const [dailyProgress] = useState(65);

  const renderNutrientItem = (name, data) => (
    <View style={styles.nutrientItem} key={name}>
      <View style={styles.nutrientHeader}>
        <View style={styles.nutrientTitleContainer}>
          <Text style={styles.nutrientIcon}>{data.icon}</Text>
          <Text style={styles.nutrientName}>{name}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.nutrientAmount}>{data.amount}</Text>
        </View>
      </View>
      <Text style={styles.nutrientDescription}>{data.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Nutrients</Text>
        <Text style={styles.subtitle}>Powering your energy</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Daily Goal</Text>
            <Text style={styles.progressPercentage}>{dailyProgress}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${dailyProgress}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeView === 'macro' && styles.activeToggle,
          ]}
          onPress={() => setActiveView('macro')}
        >
          <Text style={[
            styles.toggleText,
            activeView === 'macro' && styles.activeToggleText,
          ]}>
            Macronutrients
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeView === 'micro' && styles.activeToggle,
          ]}
          onPress={() => setActiveView('micro')}
        >
          <Text style={[
            styles.toggleText,
            activeView === 'micro' && styles.activeToggleText,
          ]}>
            Micronutrients
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(activeView === 'macro' ? macronutrients : micronutrients)
          .map(([name, data]) => renderNutrientItem(name, data))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 10,
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
    marginBottom: 8,
    color: '#2D3436',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#636E72',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00B894',
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E8E8E8',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00B894',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F8F9FA',
  },
  activeToggle: {
    backgroundColor: '#00B894',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#636E72',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  nutrientItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  nutrientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutrientTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutrientIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  nutrientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  amountContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  nutrientAmount: {
    fontSize: 16,
    color: '#00B894',
    fontWeight: '600',
  },
  nutrientDescription: {
    fontSize: 16,
    color: '#636E72',
    lineHeight: 22,
  },
});

export default NutrientsScreen;
