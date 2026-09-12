import axios from 'axios';

// The base URL can be defined in .env as VITE_API_BASE_URL
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock interceptor can be added here based on VITE_USE_MOCK_API
apiClient.interceptors.request.use(config => {
  // Add auth token if needed
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    // Basic error handling
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
