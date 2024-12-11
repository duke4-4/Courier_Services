import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const parcelApi = {
  getParcels: () => api.get('/parcels'),
  getParcel: (id) => api.get(`/parcels/${id}`),
  createParcel: (data) => api.post('/parcels', data),
  updateParcel: (data) => api.put(`/parcels/${data.id}`, data),
  deleteParcel: (id) => api.delete(`/parcels/${id}`)
};

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me')
}; 