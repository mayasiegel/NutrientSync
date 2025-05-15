import api from './api';

export const calorieMetricsMen = async () => {
  try {
    // Google Sheets API call to fetch calorie guidelines
    const response = await api.get('1uzO3ClsTVOTjtaz3deGXCXjm5okfjpYRisTkWmLRWMY');
    return response.data;
  } catch (error) {
    console.error('Error fetching calorie guidelines:', error);
    throw error;
  }
};

export const calorieMetricsWomen = async () => {
    try {
      // Google Sheets API call to fetch calorie guidelines
      const response = await api.get('1rSwF19RPiH2Rx5UxcGQoypKBxSC1KblOHlX2sRzXGec');
      return response.data;
    } catch (error) {
      console.error('Error fetching calorie guidelines:', error);
      throw error;
    }
  };

// Add other sheets-related API calls here
