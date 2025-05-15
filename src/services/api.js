import axios from 'axios';

// Create base axios instance with common configuration
const api = axios.create({
  // You'll add your base URL and any default headers here
  baseURL: 'YOUR_API_BASE_URL',
  headers: {
    'Content-Type': 'application/json',
    // API key if needed
  }
});

export default api;
