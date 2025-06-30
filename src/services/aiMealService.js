// AI Meal Planning Service
// Note: In production, this should call your backend API, not directly to OpenAI

// Mock OpenAI response for development (replace with real API call)
const MOCK_OPENAI_RESPONSE = {
  meal: {
    name: "Dynamic Meal",
    time: "15 min",
    ingredients: ["Chicken Breast", "Rice", "Broccoli"],
    instructions: "1. Cook chicken in pan (8 min)\n2. Microwave rice (3 min)\n3. Steam broccoli (4 min)\n4. Combine and season",
    nutrition: { calories: 450, protein: 45, carbs: 45, fat: 8 }
  },
  text: "Here's a personalized meal suggestion based on your preferences and available ingredients!"
};

export class AIMealService {
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY; // Store in env vars
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generateMealSuggestion(userInput, userProfile, inventory, conversationState = {}) {
    try {
      // In production, this would be a call to your backend API
      // For now, we'll simulate the AI response with smart logic
      return await this.simulateAIResponse(userInput, userProfile, inventory, conversationState);
    } catch (error) {
      console.error('AI Meal Service Error:', error);
      throw new Error('Failed to generate meal suggestion. Please try again.');
    }
  }

  async simulateAIResponse(userInput, userProfile, inventory, conversationState = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const input = userInput.toLowerCase();
    const profile = userProfile || {};
    const availableIngredients = inventory || [];
    // Exclude ingredients from conversationState
    let filteredIngredients = availableIngredients;
    if (conversationState.excludedIngredients && conversationState.excludedIngredients.length > 0) {
      filteredIngredients = availableIngredients.filter(
        food => !conversationState.excludedIngredients.some(ex => food.name.toLowerCase().includes(ex.toLowerCase()))
      );
    }
    // Create a more intelligent response based on context
    let mealSuggestion = this.generateContextualMeal(input, profile, filteredIngredients);
    
    return {
      id: Date.now() + 1,
      type: 'ai',
      text: this.generateConversationalResponse(input, mealSuggestion, profile),
      timestamp: new Date(),
      meal: mealSuggestion
    };
  }

  generateContextualMeal(userInput, profile, inventory) {
    const input = userInput.toLowerCase();
    const { activity_level, sport, diet, allergies, goal, season } = profile;
    
    // Filter inventory based on dietary restrictions
    let availableFoods = this.filterByDietaryRestrictions(inventory, diet, allergies);
    
    // Determine meal type and requirements
    let mealRequirements = this.analyzeMealRequirements(input, profile);
    
    // Generate meal based on requirements
    return this.createMealFromRequirements(mealRequirements, availableFoods);
  }

  filterByDietaryRestrictions(inventory, diet, allergies) {
    if (!inventory || inventory.length === 0) {
      // Fallback to mock inventory if none provided
      return [
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
    }

    let filtered = [...inventory];

    // Filter by diet
    if (diet) {
      const dietLower = diet.toLowerCase();
      if (dietLower.includes('vegetarian') || dietLower.includes('vegan')) {
        filtered = filtered.filter(food => 
          !['Meat', 'Fish'].includes(food.category)
        );
      }
      if (dietLower.includes('keto')) {
        filtered = filtered.filter(food => 
          food.carbs < 10 // Low carb foods
        );
      }
    }

    // Filter by allergies
    if (allergies) {
      const allergyList = allergies.toLowerCase().split(',').map(a => a.trim());
      filtered = filtered.filter(food => 
        !allergyList.some(allergy => 
          food.name.toLowerCase().includes(allergy)
        )
      );
    }

    return filtered;
  }

  analyzeMealRequirements(input, profile) {
    const { goal, season, sport, activity_level } = profile;
    const requirements = {
      mealType: 'general',
      timeConstraint: 'normal',
      proteinFocus: false,
      carbFocus: false,
      fatFocus: false,
      quickPrep: false,
      calorieAdjustment: 0,
      proteinAdjustment: 0,
      carbAdjustment: 0
    };

    // Determine meal type
    if (input.includes('breakfast') || input.includes('morning')) {
      requirements.mealType = 'breakfast';
    } else if (input.includes('lunch') || input.includes('midday')) {
      requirements.mealType = 'lunch';
    } else if (input.includes('dinner') || input.includes('evening')) {
      requirements.mealType = 'dinner';
    }

    // Determine time constraints
    if (input.includes('quick') || input.includes('fast') || input.includes('time')) {
      requirements.timeConstraint = 'quick';
      requirements.quickPrep = true;
    }

    // Determine nutritional focus based on goal
    switch (goal) {
      case 'Gain Weight':
        requirements.calorieAdjustment = 300; // Higher calories
        requirements.carbAdjustment = 1; // More carbs
        requirements.proteinAdjustment = 0.2; // Slightly more protein
        break;
      case 'Lose Weight':
        requirements.calorieAdjustment = -200; // Lower calories
        requirements.proteinAdjustment = 0.3; // Higher protein to preserve muscle
        requirements.carbAdjustment = -1; // Lower carbs
        break;
      case 'Build Muscle':
        requirements.calorieAdjustment = 200; // Moderate surplus
        requirements.proteinAdjustment = 0.4; // High protein
        requirements.carbAdjustment = 0.5; // Moderate carbs
        break;
      case 'Improve Performance':
        requirements.calorieAdjustment = 150; // Small surplus
        requirements.proteinAdjustment = 0.2; // High protein
        requirements.carbAdjustment = 1.5; // High carbs for energy
        break;
      case 'Maintain Weight':
      default:
        requirements.calorieAdjustment = 0; // Maintenance
        requirements.proteinAdjustment = 0.1; // Moderate protein
        requirements.carbAdjustment = 0; // Moderate carbs
        break;
    }

    // Adjust for season
    if (season === 'Inseason') {
      requirements.calorieAdjustment += 200; // Higher energy needs during season
      requirements.carbAdjustment += 1; // More carbs for competition
      requirements.proteinAdjustment += 0.1; // Slightly more protein
    } else if (season === 'Pre-season') {
      requirements.calorieAdjustment += 100; // Building up for season
      requirements.proteinAdjustment += 0.2; // Higher protein for preparation
    } else if (season === 'Post-season') {
      requirements.calorieAdjustment -= 100; // Recovery period
      requirements.proteinAdjustment += 0.1; // Maintain protein for recovery
    }

    // Determine nutritional focus
    if (input.includes('protein') || input.includes('muscle') || profile.sport) {
      requirements.proteinFocus = true;
    }
    if (input.includes('carb') || input.includes('energy')) {
      requirements.carbFocus = true;
    }
    if (input.includes('fat') || input.includes('keto')) {
      requirements.fatFocus = true;
    }

    // Consider activity level
    if (profile.activity_level === 'Active' || profile.sport) {
      requirements.proteinFocus = true;
    }

    return requirements;
  }

  createMealFromRequirements(requirements, availableFoods) {
    let selectedFoods = [];
    let totalNutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    let prepTime = 0;

    // Select foods based on requirements
    if (requirements.mealType === 'breakfast') {
      selectedFoods = this.selectBreakfastFoods(availableFoods, requirements);
    } else if (requirements.proteinFocus) {
      selectedFoods = this.selectHighProteinFoods(availableFoods, requirements);
    } else {
      selectedFoods = this.selectBalancedFoods(availableFoods, requirements);
    }

    // Calculate nutrition and prep time
    selectedFoods.forEach(food => {
      totalNutrition.calories += food.calories || 0;
      totalNutrition.protein += food.protein || 0;
      totalNutrition.carbs += food.carbs || 0;
      totalNutrition.fat += food.fat || 0;
    });

    // Estimate prep time
    prepTime = this.estimatePrepTime(selectedFoods, requirements.quickPrep);

    return {
      name: this.generateMealName(selectedFoods, requirements),
      time: `${prepTime} min`,
      ingredients: selectedFoods.map(f => f.name),
      instructions: this.generateInstructions(selectedFoods, requirements),
      nutrition: {
        calories: Math.round(totalNutrition.calories),
        protein: Math.round(totalNutrition.protein),
        carbs: Math.round(totalNutrition.carbs),
        fat: Math.round(totalNutrition.fat)
      }
    };
  }

  selectBreakfastFoods(availableFoods, requirements) {
    const breakfastFoods = availableFoods.filter(food => 
      ['Grains', 'Dairy', 'Fruits'].includes(food.category)
    );
    
    if (breakfastFoods.length >= 3) {
      return breakfastFoods.slice(0, 3);
    }
    return breakfastFoods.slice(0, Math.min(3, breakfastFoods.length));
  }

  selectHighProteinFoods(availableFoods, requirements) {
    const proteinFoods = availableFoods.filter(food => 
      food.protein > 10 || food.category === 'Meat'
    );
    
    const otherFoods = availableFoods.filter(food => 
      food.protein <= 10 && food.category !== 'Meat'
    );

    let selected = proteinFoods.slice(0, 2);
    if (otherFoods.length > 0) {
      selected.push(otherFoods[0]);
    }
    
    return selected;
  }

  selectBalancedFoods(availableFoods, requirements) {
    // Select one from each category if possible
    const categories = ['Meat', 'Grains', 'Vegetables'];
    let selected = [];
    
    categories.forEach(category => {
      const categoryFoods = availableFoods.filter(food => food.category === category);
      if (categoryFoods.length > 0) {
        selected.push(categoryFoods[0]);
      }
    });

    return selected.length > 0 ? selected : availableFoods.slice(0, 3);
  }

  estimatePrepTime(foods, quickPrep) {
    let baseTime = 15;
    
    if (quickPrep) {
      baseTime = 10;
    }
    
    // Add time based on food types
    const hasMeat = foods.some(f => f.category === 'Meat');
    const hasGrains = foods.some(f => f.category === 'Grains');
    
    if (hasMeat && hasGrains) {
      baseTime += 5;
    }
    
    return baseTime;
  }

  generateMealName(foods, requirements) {
    const categories = foods.map(f => f.category);
    
    if (requirements.mealType === 'breakfast') {
      return "Power Breakfast";
    }
    
    if (requirements.proteinFocus) {
      return "Protein Power Bowl";
    }
    
    if (categories.includes('Meat') && categories.includes('Grains')) {
      return `${foods.find(f => f.category === 'Meat')?.name} Bowl`;
    }
    
    return "Nutrient-Rich Meal";
  }

  generateInstructions(foods, requirements) {
    const instructions = [];
    let step = 1;
    
    // Sort foods by cooking time
    const sortedFoods = [...foods].sort((a, b) => {
      const timeA = this.getCookingTime(a, requirements.quickPrep);
      const timeB = this.getCookingTime(b, requirements.quickPrep);
      return timeA - timeB;
    });

    sortedFoods.forEach(food => {
      const time = this.getCookingTime(food, requirements.quickPrep);
      const method = this.getCookingMethod(food, requirements.quickPrep);
      instructions.push(`${step}. ${method} ${food.name} (${time} min)`);
      step++;
    });

    instructions.push(`${step}. Combine all ingredients and season to taste`);
    
    return instructions.join('\n');
  }

  getCookingTime(food, quickPrep) {
    const baseTimes = {
      'Meat': quickPrep ? 8 : 12,
      'Grains': quickPrep ? 3 : 8,
      'Vegetables': quickPrep ? 4 : 6,
      'Fruits': 0,
      'Dairy': 0
    };
    
    return baseTimes[food.category] || 5;
  }

  getCookingMethod(food, quickPrep) {
    const methods = {
      'Meat': quickPrep ? 'Pan-fry' : 'Grill or bake',
      'Grains': quickPrep ? 'Microwave' : 'Boil',
      'Vegetables': quickPrep ? 'Steam' : 'Roast',
      'Fruits': 'Slice',
      'Dairy': 'Add'
    };
    
    return methods[food.category] || 'Prepare';
  }

  generateConversationalResponse(input, meal, profile) {
    const responses = [
      `Perfect! Here's a ${meal.name.toLowerCase()} that fits your needs:`,
      `Great choice! I've created a ${meal.name.toLowerCase()} for you:`,
      `Here's a delicious ${meal.name.toLowerCase()} using your ingredients:`,
      `I've put together a ${meal.name.toLowerCase()} that's perfect for you:`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Real OpenAI integration (for production)
  async callOpenAI(userInput, userProfile, inventory) {
    const systemPrompt = `
You are an AI meal planning assistant for student-athletes. Create quick, nutritious meals based on available ingredients.

User Profile:
- Activity Level: ${userProfile?.activity_level || 'Not specified'}
- Sport: ${userProfile?.sport || 'Not specified'}
- Diet: ${userProfile?.diet || 'No restrictions'}
- Allergies: ${userProfile?.allergies || 'None'}
- Nutrition Goal: ${userProfile?.goal || 'Not specified'}
- Current Season: ${userProfile?.season || 'Not specified'}

Available Ingredients:
${inventory.map(item => `- ${item.name} (${item.category})`).join('\n')}

Respond with a JSON object containing:
{
  "meal": {
    "name": "Meal Name",
    "time": "Prep time in minutes",
    "ingredients": ["ingredient1", "ingredient2"],
    "instructions": "Step-by-step cooking instructions",
    "nutrition": {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  },
  "text": "Conversational response explaining the meal"
}

Focus on:
- Quick preparation (under 20 minutes)
- High protein for athletes
- Balanced nutrition
- Using available ingredients
- Time efficiency
- Aligning with user's nutrition goal (${userProfile?.goal || 'general health'})
- Season-appropriate nutrition (${userProfile?.season || 'general'})
`;

    try {
      // This would be a real OpenAI API call in production
      const response = await fetch('/api/generate-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userInput }
          ]
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }
}

export default new AIMealService(); 