export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const WS_URL = import.meta.env.VITE_WS_URL;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    CURRENT_USER: '/auth/me',
  },
  PARCELS: {
    BASE: '/parcels',
    BY_ID: (id) => `/parcels/${id}`,
    TRACK: (trackingNumber) => `/parcels/track/${trackingNumber}`,
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
  },
  BRANCHES: {
    BASE: '/branches',
    BY_ID: (id) => `/branches/${id}`,
  },
}; 