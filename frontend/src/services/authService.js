// frontend/src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth';

const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login/`, { email, password });
    if (response.data.tokens) {
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  signup: async (fullName, email, password) => {
    const response = await axios.post(`${API_URL}/signup/`, {
      full_name: fullName,
      email,
      password,
    });
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
      await axios.post(`${API_URL}/logout/`, { refresh: refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;