import axios from 'axios';

const USDA_API_KEY = 'VbRVsufCwpfHvMgaHGdf6UJktXHVo5Oy9nSxgUcM';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

const usdaApi = {
  /**
   * Search for foods in the USDA database
   * @param {string} query - The search query
   * @param {number} pageSize - Number of results per page (default: 25)
   * @param {number} pageNumber - Page number (default: 1)
   * @returns {Promise} - The search results
   */
  searchFoods: async (query, pageSize = 25, pageNumber = 1) => {
    try {
      console.log('Making API request to:', `${BASE_URL}/foods/search`);
      
      const params = {
        api_key: USDA_API_KEY,
        query: query.trim(),
        pageSize,
        pageNumber,
        dataType: 'Survey (FNDDS),Foundation,SR Legacy'
      };

      console.log('With params:', params);

      const response = await axios.get(`${BASE_URL}/foods/search`, {
        params,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response Status:', response.status);
      return response.data;
    } catch (error) {
      console.error('API Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  /**
   * Get detailed information about a specific food
   * @param {number} fdcId - The FoodData Central ID of the food
   * @returns {Promise} - The food details
   */
  getFoodDetails: async (fdcId) => {
    try {
      const response = await axios.get(`${BASE_URL}/food/${fdcId}`, {
        params: {
          api_key: USDA_API_KEY,
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting food details:', error);
      throw error;
    }
  },
};

export default usdaApi; 