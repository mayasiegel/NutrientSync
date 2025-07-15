import { supabase } from '../lib/supabase';

class MealRecommendationService {
  // Get meal recommendations based on recent event logs
  async getRecommendationsFromRecentLogs(userId, hoursBack = 24) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get recent event logs
      const { data: recentLogs, error } = await supabase
        .from('event_logs')
        .select(`
          *,
          schedule_events (
            title,
            type,
            location
          )
        `)
        .eq('user_id', user.id)
        .gte('logged_at', new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString())
        .order('logged_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent logs:', error);
        return null;
      }

      if (!recentLogs || recentLogs.length === 0) {
        return null;
      }

      // Get the most recent log
      const mostRecent = recentLogs[0];
      return this.generateRecommendation(mostRecent);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return null;
    }
  }

  // Generate meal recommendation based on event log
  generateRecommendation(eventLog) {
    const intensity = eventLog.intensity;
    const mood = eventLog.mood;
    const soreness = eventLog.soreness;
    const hour = new Date().getHours();
    const isEvening = hour >= 17;
    const isMorning = hour < 12;

    let recommendation = {
      title: '',
      description: '',
      foods: [],
      timing: '',
      hydration: '',
      recovery: ''
    };

    // High intensity recommendations
    if (intensity === 'high') {
      if (isEvening) {
        recommendation = {
          title: "Recovery Dinner",
          description: "High-protein meal with complex carbs to replenish glycogen stores and support muscle recovery",
          foods: ["Grilled chicken breast", "Sweet potato", "Broccoli", "Greek yogurt with berries"],
          timing: "Eat within 30-60 minutes after practice",
          hydration: "Drink 16-20 oz of water with electrolytes",
          recovery: "Consider a protein shake if you're still hungry"
        };
      } else if (isMorning) {
        recommendation = {
          title: "Pre-Workout Fuel",
          description: "Light, easily digestible meal with moderate protein and carbs",
          foods: ["Banana", "Oatmeal with nuts", "Greek yogurt", "Protein shake"],
          timing: "Eat 1-2 hours before practice",
          hydration: "Drink 8-12 oz of water",
          recovery: "Bring a sports drink for during practice"
        };
      } else {
        recommendation = {
          title: "Performance Lunch",
          description: "Balanced meal to fuel afternoon training",
          foods: ["Turkey sandwich", "Quinoa salad", "Apple", "Almonds"],
          timing: "Eat 2-3 hours before practice",
          hydration: "Drink 12-16 oz of water",
          recovery: "Have a light snack 30 minutes before"
        };
      }
    }
    // Moderate intensity recommendations
    else if (intensity === 'moderate') {
      recommendation = {
        title: "Balanced Meal",
        description: "Well-rounded meal with protein, carbs, and healthy fats",
        foods: ["Salmon", "Brown rice", "Mixed vegetables", "Avocado"],
        timing: "Eat 1-2 hours before or after practice",
        hydration: "Drink 8-12 oz of water",
        recovery: "Light stretching and rest"
      };
    }
    // Low intensity recommendations
    else {
      recommendation = {
        title: "Light Meal",
        description: "Simple, nutritious meal to maintain energy levels",
        foods: ["Turkey sandwich", "Apple", "Carrot sticks", "Water"],
        timing: "Eat when convenient",
        hydration: "Drink 6-8 oz of water",
        recovery: "Gentle movement and rest"
      };
    }

    // Adjust based on mood and soreness
    if (soreness === 'high' || mood === 'Tired') {
      recommendation.foods.push("Tart cherry juice");
      recommendation.recovery += " • Consider anti-inflammatory foods";
    }

    if (mood === 'Great!') {
      recommendation.description += " - Keep up the great energy!";
    }

    return {
      ...recommendation,
      eventTitle: eventLog.schedule_events?.title || 'Recent Activity',
      intensity: intensity,
      mood: mood,
      loggedAt: eventLog.logged_at
    };
  }

  // Get upcoming events for meal planning
  async getUpcomingEvents(userId, hoursAhead = 24) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: events, error } = await supabase
        .from('schedule_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', new Date().toISOString())
        .lte('start_time', new Date(Date.now() + hoursAhead * 60 * 60 * 1000).toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching upcoming events:', error);
        return [];
      }

      return events || [];
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  }

  // Get pre-workout meal suggestions
  getPreWorkoutMeal(eventType, timeUntilEvent) {
    const suggestions = {
      'practice': {
        '2-3 hours': {
          title: "Full Meal",
          foods: ["Chicken and rice", "Sweet potato", "Vegetables", "Water"]
        },
        '1-2 hours': {
          title: "Light Meal",
          foods: ["Turkey sandwich", "Banana", "Greek yogurt", "Water"]
        },
        '30-60 minutes': {
          title: "Quick Snack",
          foods: ["Banana", "Energy bar", "Sports drink", "Water"]
        }
      },
      'game': {
        '3-4 hours': {
          title: "Performance Meal",
          foods: ["Pasta with lean protein", "Bread", "Fruits", "Electrolytes"]
        },
        '1-2 hours': {
          title: "Pre-Game Fuel",
          foods: ["Energy bar", "Banana", "Sports drink", "Water"]
        }
      }
    };

    let timeCategory = '30-60 minutes';
    if (timeUntilEvent >= 120) timeCategory = '2-3 hours';
    else if (timeUntilEvent >= 60) timeCategory = '1-2 hours';

    return suggestions[eventType]?.[timeCategory] || suggestions.practice['30-60 minutes'];
  }

  // Mock data for development
  getMockRecommendation() {
    return {
      title: "Recovery Dinner",
      description: "High-protein meal with complex carbs to replenish glycogen stores",
      foods: ["Grilled chicken breast", "Sweet potato", "Broccoli", "Greek yogurt with berries"],
      timing: "Eat within 30-60 minutes after practice",
      hydration: "Drink 16-20 oz of water with electrolytes",
      recovery: "Consider a protein shake if you're still hungry",
      eventTitle: "Basketball Practice",
      intensity: "high",
      mood: "Great!",
      loggedAt: new Date().toISOString()
    };
  }
}

export default new MealRecommendationService(); 