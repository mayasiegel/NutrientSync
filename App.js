import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from './src/lib/supabase'; // You'll need to copy and convert supabase.ts to this path
import Auth from './src/components/Auth'; // You'll need to copy and convert Auth.tsx to this path
import CompleteProfile from './src/components/CompleteProfile';

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
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

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

  useEffect(() => {
    async function fetchProfile() {
      if (session && session.user) {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data);
        setLoadingProfile(false);
      } else {
        setProfile(null);
      }
    }
    fetchProfile();
  }, [session]);

  if (!session) return <Auth />;
  if (loadingProfile) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  // Required fields for a complete profile
  const requiredFields = [
    profile?.username, 
    profile?.age, 
    profile?.gender, 
    profile?.weight_lbs, 
    profile?.height_feet, 
    profile?.height_inches, 
    profile?.activity_level
  ];
  
  console.log('Profile data:', profile);
  console.log('Required fields:', requiredFields);
  
  const isProfileComplete = requiredFields.every((field) => {
    // Handle both string and numeric fields
    if (typeof field === 'string') {
      return field && field.length > 0;
    } else if (typeof field === 'number') {
      return field !== null && field !== undefined;
    } else {
      return field !== null && field !== undefined;
    }
  });
  
  console.log('Is profile complete:', isProfileComplete);

  // Temporary override for testing - remove this after fixing the issue
  const forceComplete = true; // Set to false to use normal logic
  
  if (!isProfileComplete && !forceComplete) {
    return (
      <CompleteProfile
        user={session.user}
        onComplete={async () => {
          // Refetch profile after completion
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(data);
        }}
      />
    );
  }

  return (
    <NavigationContainer>
      <MainApp session={session} />
    </NavigationContainer>
  );
}