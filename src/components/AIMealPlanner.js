import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { supabase } from '../lib/supabase';
import aiMealService from '../services/aiMealService';

// Mock inventory data (replace with real data later)
const MOCK_INVENTORY = [
  { name: 'Chicken Breast', category: 'Meat', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Rice', category: 'Grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Broccoli', category: 'Vegetables', calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  { name: 'Sweet Potato', category: 'Vegetables', calories: 103, protein: 2, carbs: 24, fat: 0.2 },
  { name: 'Eggs', category: 'Dairy', calories: 70, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Oatmeal', category: 'Grains', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { name: 'Banana', category: 'Fruits', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Greek Yogurt', category: 'Dairy', calories: 130, protein: 23, carbs: 9, fat: 0.4 },
  { name: 'Salmon', category: 'Meat', calories: 208, protein: 25, carbs: 0, fat: 12 },
  { name: 'Quinoa', category: 'Grains', calories: 120, protein: 4.4, carbs: 22, fat: 1.9 },
];

// Quick meal suggestions
const QUICK_MEALS = [
  {
    name: "Protein Bowl",
    time: "15 min",
    ingredients: ["Chicken Breast", "Rice", "Broccoli"],
    instructions: "1. Cook chicken in pan (8 min)\n2. Microwave rice (3 min)\n3. Steam broccoli (4 min)\n4. Combine and season",
    nutrition: { calories: 450, protein: 45, carbs: 45, fat: 8 }
  },
  {
    name: "Power Breakfast",
    time: "10 min", 
    ingredients: ["Oatmeal", "Banana", "Greek Yogurt"],
    instructions: "1. Cook oatmeal (5 min)\n2. Slice banana\n3. Top with yogurt and honey",
    nutrition: { calories: 385, protein: 29, carbs: 63, fat: 8 }
  },
  {
    name: "Quick Salmon Plate",
    time: "20 min",
    ingredients: ["Salmon", "Sweet Potato", "Broccoli"],
    instructions: "1. Bake salmon (15 min)\n2. Microwave sweet potato (8 min)\n3. Steam broccoli (5 min)",
    nutrition: { calories: 366, protein: 32, carbs: 35, fat: 13 }
  }
];

export default function AIMealPlanner({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: "Hey! I'm your AI meal planner. I can help you create quick, nutritious meals from your inventory. What would you like to eat today?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedMeals, setSuggestedMeals] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [loading, setLoading] = useState(true);
  const [conversationState, setConversationState] = useState({
    excludedIngredients: [],
    lastMeal: null,
  });
  const scrollViewRef = useRef();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  async function fetchUserData() {
    setLoading(true);
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        console.log('No user session found');
        setLoading(false);
        return;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setUserProfile(profile);
      }

      // TODO: Fetch real inventory data
      // const { data: inventoryData, error: inventoryError } = await supabase
      //   .from('inventory')
      //   .select('*')
      //   .eq('user_id', session.user.id);
      
      // if (!inventoryError && inventoryData) {
      //   setInventory(inventoryData);
      // }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // --- FEEDBACK HANDLING ---
    let updatedConversationState = { ...conversationState };
    // Simple feedback parser for exclusions
    const lowerInput = inputText.toLowerCase();
    const excludePatterns = [
      /don[''`]?t want ([a-zA-Z ]+)/i,
      /no ([a-zA-Z ]+)/i,
      /remove ([a-zA-Z ]+)/i,
      /without ([a-zA-Z ]+)/i,
      /exclude ([a-zA-Z ]+)/i,
      /allergic to ([a-zA-Z ]+)/i
    ];
    for (const pattern of excludePatterns) {
      const match = lowerInput.match(pattern);
      if (match && match[1]) {
        const ingredient = match[1].trim().replace(/\s+$/, '');
        if (ingredient && !updatedConversationState.excludedIngredients.includes(ingredient)) {
          updatedConversationState.excludedIngredients = [
            ...updatedConversationState.excludedIngredients,
            ingredient.charAt(0).toUpperCase() + ingredient.slice(1)
          ];
        }
      }
    }
    // --- END FEEDBACK HANDLING ---

    try {
      // Use the AI service to generate response
      const aiResponse = await aiMealService.generateMealSuggestion(
        inputText,
        userProfile,
        inventory,
        updatedConversationState
      );
      setMessages(prev => [...prev, aiResponse]);
      // Update last meal and conversation state
      setConversationState(prev => ({
        ...updatedConversationState,
        lastMeal: aiResponse.meal || prev.lastMeal
      }));
    } catch (error) {
      console.error('AI Service Error:', error);
      // Fallback to simple response
      const fallbackResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I'm having trouble generating a meal right now. Try asking for something specific like 'breakfast' or 'high protein meal'.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestQuickMeals = () => {
    setSuggestedMeals(QUICK_MEALS);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message) => (
    <View key={message.id} style={[
      styles.messageContainer,
      message.type === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <Text style={[
        styles.messageText,
        message.type === 'user' ? styles.userMessageText : styles.aiMessageText
      ]}>
        {message.text}
      </Text>
      
      {message.meal && (
        <View style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealName}>{message.meal.name}</Text>
            <Text style={styles.mealTime}>⏱️ {message.meal.time}</Text>
          </View>
          
          <Text style={styles.mealSubtitle}>Ingredients:</Text>
          <Text style={styles.mealIngredients}>
            {message.meal.ingredients.join(', ')}
          </Text>
          
          <Text style={styles.mealSubtitle}>Instructions:</Text>
          <Text style={styles.mealInstructions}>{message.meal.instructions}</Text>
          
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionItem}>🔥 {message.meal.nutrition.calories} cal</Text>
            <Text style={styles.nutritionItem}>💪 {message.meal.nutrition.protein}g protein</Text>
            <Text style={styles.nutritionItem}>🍞 {message.meal.nutrition.carbs}g carbs</Text>
            <Text style={styles.nutritionItem}>🥑 {message.meal.nutrition.fat}g fat</Text>
          </View>
          
          <TouchableOpacity style={styles.cookButton}>
            <Text style={styles.cookButtonText}>Start Cooking</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your preferences...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Meal Planner</Text>
        <TouchableOpacity onPress={suggestQuickMeals}>
          <Text style={styles.suggestButton}>💡</Text>
        </TouchableOpacity>
      </View>

      {/* User Profile Summary */}
      {userProfile && (
        <View style={styles.profileSummary}>
          <Text style={styles.profileText}>
            👤 {userProfile.username || 'Athlete'} • {userProfile.sport || 'General'} • {userProfile.activity_level || 'Active'}
          </Text>
          {userProfile.diet && (
            <Text style={styles.dietText}>🥗 {userProfile.diet}</Text>
          )}
        </View>
      )}

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.aiMessage]}>
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.typingText}>AI is thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Suggestions */}
      {suggestedMeals.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Quick Meal Ideas:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {suggestedMeals.map((meal, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.suggestionCard}
                onPress={() => {
                  setMessages(prev => [...prev, {
                    id: Date.now(),
                    type: 'ai',
                    text: `Here's a ${meal.name.toLowerCase()}:`,
                    timestamp: new Date(),
                    meal: meal
                  }]);
                  setSuggestedMeals([]);
                }}
              >
                <Text style={styles.suggestionName}>{meal.name}</Text>
                <Text style={styles.suggestionTime}>{meal.time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask for meal suggestions..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  suggestButton: {
    fontSize: 20,
  },
  profileSummary: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  dietText: {
    fontSize: 12,
    color: '#1976d2',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  mealCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  mealSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  mealIngredients: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  mealInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nutritionItem: {
    fontSize: 12,
    color: '#666',
  },
  cookButton: {
    backgroundColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cookButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  suggestionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  suggestionTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 