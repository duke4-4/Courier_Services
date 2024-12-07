export const EVENTS = {
  PARCEL_UPDATED: 'PARCEL_UPDATED',
  PARCEL_CREATED: 'PARCEL_CREATED',
  STATUS_UPDATED: 'STATUS_UPDATED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED'
};

// Keep track of last sync time globally
let lastSyncTime = new Date().getTime();

export const broadcastUpdate = (eventType, data) => {
  const timestamp = new Date().getTime();
  
  // Store the update details
  const updates = JSON.parse(localStorage.getItem('parcelUpdates') || '[]');
  updates.push({
    type: eventType,
    data,
    timestamp
  });

  // Keep only last 100 updates
  if (updates.length > 100) {
    updates.splice(0, updates.length - 100);
  }

  // Update localStorage
  localStorage.setItem('parcelUpdates', JSON.stringify(updates));
  localStorage.setItem('lastUpdateTime', timestamp.toString());

  // Dispatch event for same-window updates
  const event = new CustomEvent('hot-courier-update', { 
    detail: { type: eventType, data, timestamp }
  });
  window.dispatchEvent(event);
};

export const subscribeToUpdates = (callback) => {
  // Handle same-window updates
  const handleUpdate = (event) => {
    callback(event.detail);
  };

  // Check for updates every 2 seconds
  const checkForUpdates = () => {
    const updates = JSON.parse(localStorage.getItem('parcelUpdates') || '[]');
    const newUpdates = updates.filter(update => update.timestamp > lastSyncTime);

    if (newUpdates.length > 0) {
      newUpdates.forEach(update => {
        callback(update);
      });
      lastSyncTime = Math.max(...newUpdates.map(u => u.timestamp));
    }
  };

  // Set up polling
  const pollInterval = setInterval(checkForUpdates, 2000);

  // Listen for storage events from other tabs/windows
  const handleStorageChange = (e) => {
    if (e.key === 'parcelUpdates' && e.newValue) {
      checkForUpdates();
    }
  };

  window.addEventListener('hot-courier-update', handleUpdate);
  window.addEventListener('storage', handleStorageChange);

  // Initial check
  checkForUpdates();

  // Return cleanup function
  return () => {
    window.removeEventListener('hot-courier-update', handleUpdate);
    window.removeEventListener('storage', handleStorageChange);
    clearInterval(pollInterval);
  };
};

// Helper function to sync data across devices
export const syncData = () => {
  const timestamp = new Date().getTime();
  const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
  
  localStorage.setItem('lastSync', timestamp.toString());
  localStorage.setItem('syncedParcels', JSON.stringify({
    timestamp,
    data: parcels
  }));
};

// Add this to MyParcels.jsx loadParcels function
export const loadParcelsWithSync = () => {
  const allParcels = JSON.parse(localStorage.getItem('parcels') || '[]');
  const syncedData = JSON.parse(localStorage.getItem('syncedParcels') || '{}');
  
  // If synced data is newer, use it
  if (syncedData.timestamp > lastSyncTime) {
    lastSyncTime = syncedData.timestamp;
    return syncedData.data;
  }
  
  return allParcels;
}; 