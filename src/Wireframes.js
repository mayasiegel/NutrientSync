import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import InventoryScreen from './screens/InventoryScreen';
//import MealsScreen from './screens/MealsScreen';
// import RecipesScreen from './screens/RecipesScreen';
import ProfileScreen from './screens/ProfileScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Define your color palette
const colors = {
  blackOlive: '#34403A',
  emerald: '#0CCE6B',
  whiteSmoke: '#F2F4F3',
  glaucous: '#507DBC',
  satinGold: '#C8963E',
  background: '#6FD08C',
  tabBar: '#D3F4E6' // New tab bar color
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Meals') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Recipes') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.blackOlive,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: colors.tabBar, // Set tab bar background color
          borderTopColor: colors.blackOlive, // Optional: add a border to the top of the tab bar
          borderTopWidth: 1, // Optional: border width
        },
        headerStyle: {
          backgroundColor: colors.blackOlive,
        },
        headerTintColor: colors.whiteSmoke,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={HomeTabs} />
        {/* Add other screens that aren't in the tab bar here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
} 