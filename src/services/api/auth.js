import api from './axios';
import { API_ENDPOINTS } from '../../config/api';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem('token');
  },

  getCurrentUser: () => api.get(API_ENDPOINTS.AUTH.CURRENT_USER),
}; 