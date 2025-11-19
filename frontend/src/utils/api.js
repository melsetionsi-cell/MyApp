import axios from 'axios';

// Determine API base URL based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? `${window.location.origin}/api` 
  : 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
      console.error('Network error:', error);
      // You can show a notification to the user here
    }
    
    return Promise.reject(error);
  }
);

export default api;