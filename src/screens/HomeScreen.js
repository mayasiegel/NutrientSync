import React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  ScrollView
} from 'react-native';
import styles from '../styles/home';

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.appName}>NutrientSync</Text>
          <Text style={styles.tagline}>Your personal nutrition assistant</Text>
        </View>
        
        <View style={styles.authContainer}>
          <TouchableOpacity 
            style={styles.authButton} 
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.authButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.authButton, styles.loginButton]} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.authButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Inventory')}
          >
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/inventory-icon.png')} 
                style={styles.featureIcon}
                // If you don't have this image, replace with any icon or remove
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Food Inventory</Text>
              <Text style={styles.featureDescription}>
                Track your food items, expiration dates, and nutritional information
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Meals')}
          >
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/meals-icon.png')} 
                style={styles.featureIcon}
                // If you don't have this image, replace with any icon or remove
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Meal Planning</Text>
              <Text style={styles.featureDescription}>
                Plan your meals and track your nutritional intake
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Recipes')}
          >
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/recipes-icon.png')} 
                style={styles.featureIcon}
                // If you don't have this image, replace with any icon or remove
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Recipe Suggestions</Text>
              <Text style={styles.featureDescription}>
                Get recipe ideas based on your available ingredients
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.featureIconContainer}>
              <Image 
                source={require('../assets/profile-icon.png')} 
                style={styles.featureIcon}
                // If you don't have this image, replace with any icon or remove
              />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Profile & Preferences</Text>
              <Text style={styles.featureDescription}>
                Customize your nutrition goals and dietary preferences
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2023 NutrientSync</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

