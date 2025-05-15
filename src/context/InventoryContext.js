import React, { createContext, useContext, useState } from 'react';

const InventoryContext = createContext();

export const useInventory = () => {
  return useContext(InventoryContext);
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

  const addInventoryItem = (item) => {
    setInventory(prev => [...prev, item]);
  };

  const removeInventoryItem = (id) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const updateInventoryItemQuantity = (id, newQuantity) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        if (newQuantity <= 0) {
          return null;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const value = {
    inventory,
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItemQuantity,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}; 