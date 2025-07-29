import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, ScrollView } from 'react-native';
import usdaApi from '../services/usdaApi';

function getNutrientValue(nutrients, name) {
  return nutrients.find(n => n.nutrientName === name)?.value || 'N/A';
}

const FoodSearch = ({ onAdd }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await usdaApi.searchFoods(query);
      setResults(data.foods || []);
      console.log('Search results:', data.foods?.length || 0, 'items found');
    } catch (err) {
      console.error('Search error:', err);
      setError(`Error: ${err.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const testResult = await usdaApi.testConnection();
      if (testResult.success) {
        setError('✅ USDA API is working! Try searching for "apple" or "chicken"');
        setQuery('apple');
      } else {
        setError(`❌ USDA API test failed: ${testResult.error}`);
      }
    } catch (err) {
      setError(`❌ Test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedFood(item);
    setModalVisible(true);
  };

  const handleAdd = (item) => {
    if (onAdd) onAdd(item);
  };

  const renderItem = ({ item }) => {
    const nutrients = item.foodNutrients || [];
    const calories = getNutrientValue(nutrients, 'Energy');
    const protein = getNutrientValue(nutrients, 'Protein');
    const carbs = getNutrientValue(nutrients, 'Carbohydrate, by difference');
    const fat = getNutrientValue(nutrients, 'Total lipid (fat)');
    const fiber = getNutrientValue(nutrients, 'Fiber, total dietary');
    return (
      <View style={styles.resultItem}>
        <Text style={styles.foodName}>{item.description}</Text>
        <Text style={styles.foodDetails}>Brand: {item.brandName || 'Generic'}</Text>
        <Text style={styles.nutrientInfo}>
          Calories: {calories} kcal | Protein: {protein}g | Carbs: {carbs}g | Fat: {fat}g | Fiber: {fiber}g
        </Text>
        <View style={styles.resultActions}>
          <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(item)}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailsBtn} onPress={() => handleViewDetails(item)}>
            <Text style={styles.detailsBtnText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.searchSection}>
      <Text style={styles.header}>Add Any Food to Your Inventory</Text>
      <Text style={styles.instructions}>Search the USDA database for any food in the world and add it to your inventory!</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search for foods..."
          placeholderTextColor="#666"
          onSubmitEditing={handleSearch}
        />
        <Button title="Search" onPress={handleSearch} disabled={loading} />
      </View>
      <TouchableOpacity style={styles.testButton} onPress={handleTestAPI}>
        <Text style={styles.testButtonText}>🔧 Test USDA API</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator style={{ marginVertical: 16 }} size="large" color="#007AFF" />}
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item.fdcId.toString()}
        style={styles.list}
        ListEmptyComponent={!loading && query ? <Text style={styles.noResults}>No results found.</Text> : null}
      />
      {/* Details Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedFood?.description}</Text>
              <Text style={styles.foodDetails}>Brand: {selectedFood?.brandName || 'Generic'}</Text>
              <Text style={styles.modalSubtitle}>Nutrients per 100g:</Text>
              {(selectedFood?.foodNutrients || []).map(n => (
                <Text key={n.nutrientId} style={styles.modalNutrient}>
                  {n.nutrientName}: {n.value} {n.unitName}
                </Text>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    margin: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#007AFF',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  resultItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  foodDetails: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  nutrientInfo: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailsBtn: {
    backgroundColor: '#eee',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  detailsBtnText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  error: {
    textAlign: 'center',
    marginVertical: 8,
    color: 'red',
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007AFF',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  modalNutrient: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  closeBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 16,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#f39c12',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignSelf: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default FoodSearch; 