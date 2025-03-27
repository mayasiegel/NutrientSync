import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;

const macronutrients = {
  Protein: { amount: '46-56g', description: 'Essential for muscle growth and repair' },
  Carbohydrates: { amount: '225-325g', description: 'Primary energy source' },
  Fats: { amount: '44-77g', description: 'Important for hormone production' },
  Fiber: { amount: '25-38g', description: 'Aids digestion and satiety' },
};

const micronutrients = {
  'Vitamin A': { amount: '700-900mcg', description: 'Vision and immune health' },
  'Vitamin C': { amount: '65-90mg', description: 'Antioxidant and immune support' },
  'Vitamin D': { amount: '15-20mcg', description: 'Bone health and immunity' },
  'Iron': { amount: '8-18mg', description: 'Oxygen transport in blood' },
  'Calcium': { amount: '1000mg', description: 'Bone and teeth health' },
  'Potassium': { amount: '3500-4700mg', description: 'Blood pressure regulation' },
  'Magnesium': { amount: '310-420mg', description: 'Energy production and muscle function' },
  'Zinc': { amount: '8-11mg', description: 'Immune function and wound healing' },
};

const NutrientsScreen = () => {
  const [activeView, setActiveView] = useState('macro'); // 'macro' or 'micro'

  const renderNutrientItem = (name, data) => (
    <View style={styles.nutrientItem} key={name}>
      <View style={styles.nutrientHeader}>
        <Text style={styles.nutrientName}>{name}</Text>
        <Text style={styles.nutrientAmount}>{data.amount}</Text>
      </View>
      <Text style={styles.nutrientDescription}>{data.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Nutrients</Text>
        <Text style={styles.subtitle}>Powering your energy</Text>
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

      <ScrollView style={styles.contentContainer}>
        {Object.entries(activeView === 'macro' ? macronutrients : micronutrients)
          .map(([name, data]) => renderNutrientItem(name, data))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: SIZES.xxlarge,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: SIZES.large,
    color: COLORS.text,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.whiteSmoke,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glaucous,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: COLORS.whiteSmoke,
  },
  activeToggle: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  activeToggleText: {
    color: COLORS.whiteSmoke,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  nutrientItem: {
    backgroundColor: COLORS.whiteSmoke,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.glaucous,
  },
  nutrientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutrientName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  nutrientAmount: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: '600',
  },
  nutrientDescription: {
    fontSize: SIZES.medium,
    color: COLORS.blackOlive,
  },
});

export default NutrientsScreen;
