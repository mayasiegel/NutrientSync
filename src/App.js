import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { InventoryProvider } from './context/InventoryContext';

import HomeScreen from './screens/HomeScreen';
import InventoryScreen from './screens/InventoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import NutrientsScreen from './screens/NutrientsScreen';
import DailyFoodLogScreen from './screens/DailyFoodLogScreen';
import ScanScreen from './screens/ScanScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const colors = {
  blackOlive: '#34403A',
  emerald: '#00C6B1',
  whiteSmoke: '#F2F4F3',
  glaUcus: '#507DBC',
  satinGold: '#C89G36',
  background: '#6FD08C',
  tabBar: '#D3F4E6',
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Scan') iconName = focused ? 'scan' : 'scan-outline';
          else if (route.name === 'Inventory') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Daily') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Nutrients') iconName = focused ? 'nutrition' : 'nutrition-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.blackOlive,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Daily" component={DailyFoodLogScreen} />
      <Tab.Screen name="Nutrients" component={NutrientsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <NavigationContainer>
        <HomeTabs />
      </NavigationContainer>
    </InventoryProvider>
  );
}
