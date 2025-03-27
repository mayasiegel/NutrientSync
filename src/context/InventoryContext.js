import React, { createContext, useState, useContext } from 'react';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([
    { id: '1', name: 'Apples', quantity: 5, unit: 'pcs', expiryDate: '2023-12-15', calories: 52, category: 'Fruits' },
    { id: '2', name: 'Milk', quantity: 1, unit: 'liter', expiryDate: '2023-12-10', calories: 42, category: 'Dairy' },
    { id: '3', name: 'Chicken Breast', quantity: 500, unit: 'g', expiryDate: '2023-12-08', calories: 165, category: 'Meat' },
    { id: '4', name: 'Rice', quantity: 2, unit: 'kg', expiryDate: '2024-05-20', calories: 130, category: 'Grains' },
    { id: '5', name: 'Eggs', quantity: 12, unit: 'pcs', expiryDate: '2023-12-20', calories: 78, category: 'Dairy' },
    { id: '6', name: 'Bread', quantity: 1, unit: 'loaf', expiryDate: '2023-12-12', calories: 265, category: 'Bakery' },
    { id: '7', name: 'Cheese', quantity: 200, unit: 'g', expiryDate: '2023-12-25', calories: 402, category: 'Dairy' },
    { id: '8', name: 'Tomatoes', quantity: 6, unit: 'pcs', expiryDate: '2023-12-14', calories: 18, category: 'Vegetables' },
    { id: '9', name: 'Pasta', quantity: 500, unit: 'g', expiryDate: '2024-06-10', calories: 131, category: 'Grains' },
    { id: '10', name: 'Yogurt', quantity: 4, unit: 'cups', expiryDate: '2023-12-18', calories: 59, category: 'Dairy' },
  ]);

  const addItem = (item) => {
    setInventory([...inventory, { ...item, id: Date.now().toString() }]);
  };

  const removeItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const updateItem = (id, updates) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  return (
    <InventoryContext.Provider value={{ inventory, addItem, removeItem, updateItem }}>
      {children}
    </InventoryContext.Provider>
  );
}; 