// frontend/src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        localStorage.setItem('access_token', response.data.access);
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
        
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const authService = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/login/', { email, password });
    if (response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.profile) {
        localStorage.setItem('profile', JSON.stringify(response.data.profile));
      }
    }
    return response.data;
  },

  signup: async (userData) => {
    const response = await axiosInstance.post('/signup/', userData);
    if (response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      await axiosInstance.post('/logout/', { refresh: refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getUserProfile: async () => {
    const response = await axiosInstance.get('/profile/');
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  getUserType: () => {
    const user = authService.getCurrentUser();
    return user ? user.user_type : null;
  },

  getUserUUID: () => {
    const user = authService.getCurrentUser();
    return user ? user.uuid : null;
  }
};

export default authService;