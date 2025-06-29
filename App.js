import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { supabase } from './src/lib/supabase'; // You'll need to copy and convert supabase.ts to this path
import Auth from './src/components/Auth'; // You'll need to copy and convert Auth.tsx to this path

// Your existing screens
import HomeScreen from './src/screens/HomeScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import DailyScreen from './src/screens/DailyScreen';
import NutrientsScreen from './src/screens/NutrientsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ScanScreen from './src/screens/ScanScreen';

const Tab = createBottomTabNavigator();

// Main app tabs component (your existing navigation)
function MainApp({ session }) {
  return (
    <>
      <Tab.Navigator initialRouteName="Home">
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Scan" component={ScanScreen} />
        <Tab.Screen name="Inventory" component={InventoryScreen} />
        <Tab.Screen name="Daily" component={DailyScreen} />
        <Tab.Screen name="Nutrients" component={NutrientsScreen} />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          // Pass session to ProfileScreen so it can access user data and logout
          initialParams={{ session }}
        />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup subscription on unmount
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      {session && session.user ? (
        // User is authenticated - show your main app
        <MainApp session={session} />
      ) : (
        // User is not authenticated - show auth screen
        <View style={{ flex: 1 }}>
          <Auth />
        </View>
      )}
    </NavigationContainer>
  );
}