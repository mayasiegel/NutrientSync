// add lines when I add useState
// import React, { useState } from 'react';
//import { View, Text, StyleSheet, ScrollView, TextInput, Button } from 'react-native';

// import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import DailyFoodLogScreen from './DailyFoodLogScreen';
import { wireframeStyles } from '../styles';
import ProfileScreen from './ProfileScreen';
import InventoryScreen from './InventoryScreen';
import NutrientsScreen from './NutrientsScreen';
import HomeScreen from './HomeScreen';
import theme from '../styles/theme';

const { COLORS } = theme;

const Tab = createBottomTabNavigator();

// screens
const ScanScreen = () => (
    <View style={wireframeStyles.screen}>
      <View style={[wireframeStyles.box, wireframeStyles.flexGrow]}>
        <Text>Camera Viewfinder</Text>
      </View>
      <View style={wireframeStyles.button}>
        <Text>Scan Barcode</Text>
      </View>
      <View style={wireframeStyles.button}>
        <Text>Manual Input</Text>
      </View>
    </View>
);

const NutrientsScreenWireframe = () => (
    <View style={wireframeStyles.screen}>
      <View style={[wireframeStyles.box, wireframeStyles.flexGrow]}>
        <Text>Add Text Here</Text>
      </View>
    </View>
);

// deleted shopping and chat screen

// tabs
export default function Wireframes() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.lightGray,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: COLORS.white,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
          color: COLORS.primary,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="camera" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="package" color={color} size={size} />,
        }}
      />
      
      <Tab.Screen
        name="Nutrients"
        component={NutrientsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="pie-chart" color={color} size={size} />,
        }}
      />
      
      
      
      {/*
      <Tab.Screen
        name="Shopping"
        component={ShoppingScreen}
        options={{
          tabBarIcon: ({ color, size }) => <shopping="shopping" color={color} size={size} />,
        }}
      />
      
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="message-circle" color={color} size={size} />,
        }}
      />
      */}
      {/* Add FoodLogScreen as a new tab */}
      <Tab.Screen
        name="DailyFoodLog"
        component={DailyFoodLogScreen}
        options={{
          tabBarLabel: 'Daily Log',
          tabBarIcon: ({ color, size }) => <Icon name="book" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon name="user" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

