import { webSocket } from '../services/websocket';
import { parcelApi } from '../services/api';

export const EVENTS = {
  PARCEL_UPDATED: 'PARCEL_UPDATED',
  PARCEL_CREATED: 'PARCEL_CREATED',
  STATUS_UPDATED: 'STATUS_UPDATED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED'
};

// Broadcast update to all clients via WebSocket
export const broadcastUpdate = async (eventType, data) => {
  try {
    // Send update to server
    const response = await parcelApi.updateParcel(data);
    
    // Emit websocket event
    webSocket.emit('update', {
      type: eventType,
      data: response.data,
      timestamp: Date.now()
    });

    // Return the server response
    return response.data;
  } catch (error) {
    console.error('Failed to broadcast update:', error);
    throw error;
  }
};

export const subscribeToUpdates = (callback) => {
  // Subscribe to WebSocket events
  const unsubscribeWs = webSocket.subscribe('parcel-update', (update) => {
    callback(update);
  });

  // Initial data load
  loadParcelsWithSync();

  // Return cleanup function
  return () => {
    unsubscribeWs();
  };
};

export const loadParcelsWithSync = async () => {
  try {
    const response = await parcelApi.getParcels();
    return response.data;
  } catch (error) {
    console.error('Failed to load parcels:', error);
    throw error;
  }
}; 