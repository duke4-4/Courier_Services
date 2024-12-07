import { syncWithServer, getServerData } from '../api/sync';

export const EVENTS = {
  PARCEL_UPDATED: 'PARCEL_UPDATED',
  PARCEL_CREATED: 'PARCEL_CREATED',
  STATUS_UPDATED: 'STATUS_UPDATED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED'
};

// Keep track of last sync time globally
let lastSyncTimestamp = Date.now();

// Broadcast update to all clients and server
export const broadcastUpdate = async (eventType, data) => {
  const timestamp = Date.now();
  const update = {
    id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
    type: eventType,
    data,
    timestamp
  };

  // Save to localStorage
  const updates = JSON.parse(localStorage.getItem('updates') || '[]');
  updates.push(update);
  localStorage.setItem('updates', JSON.stringify(updates));

  // Sync with server
  await syncWithServer({
    type: 'UPDATE',
    update,
    parcels: JSON.parse(localStorage.getItem('parcels') || '[]')
  });

  // Trigger local update
  window.dispatchEvent(new CustomEvent('parcel-update', { detail: update }));
};

export const subscribeToUpdates = (callback) => {
  let pollInterval;

  const processServerUpdates = async () => {
    const serverData = await getServerData();
    if (serverData && serverData.timestamp > lastSyncTimestamp) {
      // Update local storage with server data
      localStorage.setItem('parcels', JSON.stringify(serverData.parcels));
      lastSyncTimestamp = serverData.timestamp;
      callback({ type: 'SYNC', data: serverData });
    }
  };

  // Poll server every 5 seconds
  pollInterval = setInterval(processServerUpdates, 5000);

  // Local updates
  const handleLocalUpdate = (event) => {
    callback(event.detail);
  };

  window.addEventListener('parcel-update', handleLocalUpdate);

  // Initial sync
  processServerUpdates();

  return () => {
    clearInterval(pollInterval);
    window.removeEventListener('parcel-update', handleLocalUpdate);
  };
};

export const syncData = async () => {
  const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
  const timestamp = Date.now();

  // Sync with server
  await syncWithServer({
    type: 'SYNC',
    timestamp,
    parcels
  });

  return parcels;
};

export const loadParcelsWithSync = async () => {
  // Get latest data from server
  const serverData = await getServerData();
  
  if (serverData && serverData.timestamp > lastSyncTimestamp) {
    lastSyncTimestamp = serverData.timestamp;
    localStorage.setItem('parcels', JSON.stringify(serverData.parcels));
    return serverData.parcels;
  }

  return JSON.parse(localStorage.getItem('parcels') || '[]');
}; 