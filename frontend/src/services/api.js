import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function for logout cleanup
const logoutAndRedirect = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('profile');
  
  // Only redirect if not already on login page to prevent infinite redirects
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Prevent infinite loops if already on login page
      if (window.location.pathname.includes('/login')) {
        return Promise.reject(error);
      }
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // If no refresh token, logout immediately
        if (!refreshToken) {
          console.log('API service: No refresh token available, logging out');
          logoutAndRedirect();
          return Promise.reject(error);
        }
        
        console.log('API service attempting token refresh...');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken
        });
        
        console.log('API service token refresh successful');
        localStorage.setItem('access_token', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        console.error('API service token refresh failed:', refreshError);
        // Clear storage and redirect to login
        logoutAndRedirect();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;