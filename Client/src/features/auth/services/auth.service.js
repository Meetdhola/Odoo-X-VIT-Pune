import api from '../../shared/api.js';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  verifyEmail: async (data) => {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};
