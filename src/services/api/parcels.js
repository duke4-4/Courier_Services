import api from './axios';
import { API_ENDPOINTS } from '../../config/api';

export const parcelApi = {
  getParcels: (filters = {}) => 
    api.get(API_ENDPOINTS.PARCELS.BASE, { params: filters }),

  getParcel: (id) => 
    api.get(API_ENDPOINTS.PARCELS.BY_ID(id)),

  createParcel: (data) => 
    api.post(API_ENDPOINTS.PARCELS.BASE, data),

  updateParcel: (id, data) => 
    api.put(API_ENDPOINTS.PARCELS.BY_ID(id), data),

  trackParcel: (trackingNumber) => 
    api.get(API_ENDPOINTS.PARCELS.TRACK(trackingNumber)),

  updateStatus: (id, status, note) => 
    api.post(API_ENDPOINTS.PARCELS.BY_ID(id) + '/status', { status, note }),
}; 