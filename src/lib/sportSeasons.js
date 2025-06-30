// Sport season mapping for student athletes
// Based on typical US high school/college athletic seasons

export const SPORT_SEASONS = {
  'Football': {
    season: 'Fall',
    months: [8, 9, 10, 11], // August - November
    description: 'Fall season (August - November)'
  },
  'Soccer': {
    season: 'Fall',
    months: [8, 9, 10, 11], // August - November
    description: 'Fall season (August - November)'
  },
  'Cross Country': {
    season: 'Fall',
    months: [8, 9, 10, 11], // August - November
    description: 'Fall season (August - November)'
  },
  'Volleyball': {
    season: 'Fall',
    months: [8, 9, 10, 11], // August - November
    description: 'Fall season (August - November)'
  },
  'Basketball': {
    season: 'Winter',
    months: [11, 12, 1, 2, 3], // November - March
    description: 'Winter season (November - March)'
  },
  'Wrestling': {
    season: 'Winter',
    months: [11, 12, 1, 2, 3], // November - March
    description: 'Winter season (November - March)'
  },
  'Swimming': {
    season: 'Winter',
    months: [11, 12, 1, 2, 3], // November - March
    description: 'Winter season (November - March)'
  },
  'Track & Field': {
    season: 'Spring',
    months: [3, 4, 5, 6], // March - June
    description: 'Spring season (March - June)'
  },
  'Baseball': {
    season: 'Spring',
    months: [3, 4, 5, 6], // March - June
    description: 'Spring season (March - June)'
  },
  'Lacrosse': {
    season: 'Spring',
    months: [3, 4, 5, 6], // March - June
    description: 'Spring season (March - June)'
  },
  'Tennis': {
    season: 'Spring',
    months: [3, 4, 5, 6], // March - June
    description: 'Spring season (March - June)'
  },
  'Golf': {
    season: 'Spring',
    months: [3, 4, 5, 6], // March - June
    description: 'Spring season (March - June)'
  },
  'Running': {
    season: 'Year-round',
    months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // All year
    description: 'Year-round activity'
  },
  'Hockey': {
    season: 'Winter',
    months: [10, 11, 12, 1, 2, 3], // October - March
    description: 'Winter season (October - March)'
  }
};

// Get the current season for a sport based on current date
export function getCurrentSeason(sport) {
  if (!sport || sport === 'None' || !SPORT_SEASONS[sport]) {
    return 'Offseason';
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
  const sportData = SPORT_SEASONS[sport];

  if (sportData.months.includes(currentMonth)) {
    return 'Inseason';
  } else {
    return 'Offseason';
  }
}

// Get the next season start month for a sport
export function getNextSeasonStart(sport) {
  if (!sport || sport === 'None' || !SPORT_SEASONS[sport]) {
    return null;
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const sportData = SPORT_SEASONS[sport];

  // Find the next month in the sport's season
  const nextSeasonMonth = sportData.months.find(month => month > currentMonth);
  
  if (nextSeasonMonth) {
    return nextSeasonMonth;
  } else {
    // If we're past the season, return the first month of next season
    return sportData.months[0];
  }
}

// Get season description for a sport
export function getSeasonDescription(sport) {
  if (!sport || sport === 'None' || !SPORT_SEASONS[sport]) {
    return 'No sport selected';
  }
  
  return SPORT_SEASONS[sport].description;
}

// Get all available sports
export function getAvailableSports() {
  return Object.keys(SPORT_SEASONS);
}

// Get nutrition recommendations based on goal and season
export function getNutritionRecommendations(goal, season, sport) {
  const recommendations = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    notes: []
  };

  // Base recommendations by goal
  switch (goal) {
    case 'Gain Weight':
      recommendations.calories = 500; // Surplus
      recommendations.protein = 1.8; // g per kg body weight
      recommendations.carbs = 6; // g per kg body weight
      recommendations.fat = 1.2; // g per kg body weight
      recommendations.notes.push('Calorie surplus for weight gain');
      break;
      
    case 'Lose Weight':
      recommendations.calories = -500; // Deficit
      recommendations.protein = 2.0; // Higher protein to preserve muscle
      recommendations.carbs = 4; // Lower carbs
      recommendations.fat = 1.0; // Moderate fat
      recommendations.notes.push('Calorie deficit for weight loss');
      recommendations.notes.push('Higher protein to preserve muscle mass');
      break;
      
    case 'Build Muscle':
      recommendations.calories = 300; // Moderate surplus
      recommendations.protein = 2.2; // High protein
      recommendations.carbs = 5; // Moderate carbs
      recommendations.fat = 1.0; // Moderate fat
      recommendations.notes.push('Moderate calorie surplus for muscle building');
      recommendations.notes.push('High protein intake for muscle synthesis');
      break;
      
    case 'Improve Performance':
      recommendations.calories = 200; // Small surplus
      recommendations.protein = 1.8; // High protein
      recommendations.carbs = 7; // High carbs for energy
      recommendations.fat = 1.2; // Moderate fat
      recommendations.notes.push('Performance-focused nutrition');
      recommendations.notes.push('Higher carbs for energy during training');
      break;
      
    case 'Maintain Weight':
    default:
      recommendations.calories = 0; // Maintenance
      recommendations.protein = 1.6; // Moderate protein
      recommendations.carbs = 5; // Moderate carbs
      recommendations.fat = 1.0; // Moderate fat
      recommendations.notes.push('Maintenance calories');
      break;
  }

  // Adjust for season
  if (season === 'Inseason') {
    recommendations.calories += 300; // Higher energy needs during season
    recommendations.carbs += 1; // More carbs for competition
    recommendations.notes.push('Increased calories and carbs for competition season');
  } else if (season === 'Pre-season') {
    recommendations.calories += 200; // Building up for season
    recommendations.protein += 0.2; // Slightly higher protein
    recommendations.notes.push('Pre-season preparation nutrition');
  } else if (season === 'Post-season') {
    recommendations.calories -= 200; // Recovery period
    recommendations.notes.push('Post-season recovery nutrition');
  }

  return recommendations;
} 