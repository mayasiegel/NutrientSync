import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  Modal,
  Pressable
} from 'react-native';
import { useInventory } from '../context/InventoryContext';
import inventoryStyles from '../styles/inventory';
import theme from '../styles/theme';

const { COLORS, SIZES } = theme;
const { width } = Dimensions.get('window');

const CATEGORIES = [
  { name: 'All', icon: '🧊' },
  { name: 'Fruits', icon: '🍎' },
  { name: 'Vegetables', icon: '🥬' },
  { name: 'Dairy', icon: '🥛' },
  { name: 'Meat', icon: '🥩' },
  { name: 'Pantry', icon: '🥫' },
];

const SAMPLE_ITEMS = [
  { name: 'Organic Milk', category: 'Dairy', quantity: '1 gallon', expiry: '5 days', icon: '🥛' },
  { name: 'Fresh Spinach', category: 'Vegetables', quantity: '1 bag', expiry: '3 days', icon: '🥬' },
  { name: 'Chicken Breast', category: 'Meat', quantity: '2 lbs', expiry: '2 days', icon: '🥩' },
  { name: 'Apples', category: 'Fruits', quantity: '6 pieces', expiry: '7 days', icon: '🍎' },
  { name: 'Pasta', category: 'Pantry', quantity: '2 boxes', expiry: '30 days', icon: '🍝' },
];

const CATEGORY_OPTIONS = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Pantry'];

const InventoryScreen = ({ navigation }) => {
  const { inventory, addInventoryItem, removeInventoryItem } = useInventory();
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemExpiry, setNewItemExpiry] = useState('');
  const [newItemCalories, setNewItemCalories] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  
  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemQuantity.trim()) return;
    const newItem = {
      name: newItemName,
      category: newItemCategory || 'Uncategorized',
      quantity: `${newItemQuantity} ${newItemUnit || ''}`.trim(),
      expiry: newItemExpiry || 'N/A',
      icon: '🍽️',
      calories: newItemCalories,
    };
    addInventoryItem(newItem);
    setModalVisible(false);
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemUnit('');
    setNewItemCategory('');
    setNewItemCalories('');
    setNewItemExpiry('');
  };
  
  const renderItem = (item) => (
    <View style={styles.itemContainer} key={item.id}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemInfo}>
          {item.quantity} {item.unit} • Category: {item.category}
        </Text>
        <Text style={styles.itemInfo}>
          Calories: {item.calories} kcal per serving
        </Text>
        <Text style={styles.itemInfo}>
          Expiration Date: {item.expiryDate}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => removeInventoryItem(item.id)}
        >
          <Text style={styles.actionButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const filteredItems = inventory.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Inventory</Text>
        <Text style={styles.subtitle}>Your digital refrigerator</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.buttonText}>Scan Food</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('CustomFood')}
        >
          <Text style={styles.buttonText}>Custom Food</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#636E72"
        />
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.name}
              style={[
                styles.categoryButton,
                selectedCategory === category.name && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.name && styles.selectedCategoryText,
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={{ height: 8 }} />
      </View>
      <ScrollView
        style={styles.itemsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 32 }}
      >
        {filteredItems.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemTitleContainer}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
              </View>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityText}>{item.quantity}</Text>
              </View>
            </View>
            <View style={styles.itemFooter}>
              <View style={styles.expiryContainer}>
                <Text style={styles.expiryLabel}>Expires in</Text>
                <Text style={styles.expiryValue}>{item.expiryDate}</Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Item</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Pressable style={styles.modalView}>
              <Text style={styles.modalTitle}>Add New Item</Text>
              <View style={styles.inputRow3}>
                <TextInput
                  style={[styles.modalInput, styles.inputThird, { marginRight: 6 }]}
                  placeholder="Name"
                  value={newItemName}
                  onChangeText={setNewItemName}
                />
                <TextInput
                  style={[styles.modalInput, styles.inputThird, { marginRight: 6 }]}
                  placeholder="Quantity"
                  value={newItemQuantity}
                  onChangeText={setNewItemQuantity}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.modalInput, styles.inputThird]}
                  placeholder="Unit"
                  value={newItemUnit}
                  onChangeText={setNewItemUnit}
                />
              </View>
              <View style={styles.inputRow2}>
                <TouchableOpacity
                  style={[styles.modalInput, styles.inputHalf, { marginRight: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                  onPress={() => setCategoryDropdownVisible(!categoryDropdownVisible)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: newItemCategory ? '#2D3436' : '#A0A0A0', fontSize: 16 }}>
                    {newItemCategory || 'Category'}
                  </Text>
                  <Text style={{ fontSize: 16, color: '#A0A0A0' }}>▼</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.modalInput, styles.inputHalf]}
                  placeholder="Calories"
                  value={newItemCalories}
                  onChangeText={setNewItemCalories}
                  keyboardType="numeric"
                />
              </View>
              {categoryDropdownVisible && (
                <View style={styles.dropdownMenu}>
                  {CATEGORY_OPTIONS.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setNewItemCategory(option);
                        setCategoryDropdownVisible(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TextInput
                style={styles.modalInput}
                placeholder="Expiration Date (e.g. 2024-07-01)"
                value={newItemExpiry}
                onChangeText={setNewItemExpiry}
              />
              <View style={{ flexDirection: 'row', marginTop: 16, width: '100%' }}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#E8E8E8', marginRight: 8 }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: '#636E72' }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#00B894' }]}
                  onPress={handleAddItem}
                >
                  <Text style={styles.modalButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  ...inventoryStyles,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 10,
    paddingVertical: 0,
    borderRadius: 8,
    marginRight: 10,
    height: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedCategory: {
    backgroundColor: '#00B894',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  itemsContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  itemCategory: {
    fontSize: 14,
    color: '#636E72',
  },
  quantityContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 14,
    color: '#00B894',
    fontWeight: '600',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 12,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryLabel: {
    fontSize: 14,
    color: '#636E72',
    marginRight: 8,
  },
  expiryValue: {
    fontSize: 14,
    color: '#FF7675',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: '#00B894',
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#00B894',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputRow3: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
  },
  inputThird: {
    flex: 1,
    minWidth: 0,
  },
  inputRow2: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
    minWidth: 0,
  },
  dropdownMenu: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 12,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 150,
    left: 24,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#2D3436',
  },
});

export default InventoryScreen;
