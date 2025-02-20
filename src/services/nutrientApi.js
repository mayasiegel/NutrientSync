import api from './api';

export const getNutrientInfo = async (food) => {
  try {
    const response = await api.get(`/foods/${food}/nutrients`);
    return response.data;
  } catch (error) {
    console.error('Error fetching nutrient info:', error);
    throw error;
  }
};

// Add other nutrient-related API calls here
