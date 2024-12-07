export const EVENTS = {
  PARCEL_UPDATED: 'PARCEL_UPDATED',
  PARCEL_CREATED: 'PARCEL_CREATED',
  STATUS_UPDATED: 'STATUS_UPDATED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED'
};

// Global state for sync
const SYNC_KEY = 'HOT_COURIER_SYNC';
const UPDATE_CHANNEL = 'HOT_COURIER_UPDATES';
let lastSyncTimestamp = Date.now();

// Initialize sync state
const initSyncState = () => {
  if (!localStorage.getItem(SYNC_KEY)) {
    localStorage.setItem(SYNC_KEY, JSON.stringify({
      lastUpdate: Date.now(),
      updates: [],
      activeClients: []
    }));
  }
};

// Broadcast update to all clients
export const broadcastUpdate = (eventType, data) => {
  const timestamp = Date.now();
  const update = {
    id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
    type: eventType,
    data,
    timestamp
  };

  // Get current sync state
  const syncState = JSON.parse(localStorage.getItem(SYNC_KEY) || '{}');
  
  // Add update to queue
  syncState.updates = [...(syncState.updates || []), update];
  syncState.lastUpdate = timestamp;
  
  // Keep only last 50 updates
  if (syncState.updates.length > 50) {
    syncState.updates = syncState.updates.slice(-50);
  }

  // Save back to localStorage
  localStorage.setItem(SYNC_KEY, JSON.stringify(syncState));
  
  // Trigger storage event for other tabs
  localStorage.setItem(UPDATE_CHANNEL, JSON.stringify({ timestamp, id: update.id }));
};

// Subscribe to updates
export const subscribeToUpdates = (callback) => {
  initSyncState();
  
  // Generate unique client ID
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Function to process updates
  const processUpdates = () => {
    const syncState = JSON.parse(localStorage.getItem(SYNC_KEY) || '{}');
    const newUpdates = (syncState.updates || [])
      .filter(update => update.timestamp > lastSyncTimestamp)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (newUpdates.length > 0) {
      newUpdates.forEach(update => callback(update));
      lastSyncTimestamp = Math.max(...newUpdates.map(u => u.timestamp));
    }
  };

  // Set up polling
  const pollInterval = setInterval(processUpdates, 1000);

  // Listen for storage events
  const handleStorageChange = (e) => {
    if (e.key === UPDATE_CHANNEL && e.newValue) {
      processUpdates();
    }
  };

  window.addEventListener('storage', handleStorageChange);

  // Register client
  const registerClient = () => {
    const syncState = JSON.parse(localStorage.getItem(SYNC_KEY) || '{}');
    syncState.activeClients = [...(syncState.activeClients || []), clientId];
    localStorage.setItem(SYNC_KEY, JSON.stringify(syncState));
  };

  // Unregister client
  const unregisterClient = () => {
    const syncState = JSON.parse(localStorage.getItem(SYNC_KEY) || '{}');
    syncState.activeClients = (syncState.activeClients || []).filter(id => id !== clientId);
    localStorage.setItem(SYNC_KEY, JSON.stringify(syncState));
  };

  // Register on start
  registerClient();

  // Initial check
  processUpdates();

  // Return cleanup function
  return () => {
    clearInterval(pollInterval);
    window.removeEventListener('storage', handleStorageChange);
    unregisterClient();
  };
};

// Force sync all data
export const syncData = () => {
  const timestamp = Date.now();
  const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
  
  localStorage.setItem('PARCELS_SYNC', JSON.stringify({
    timestamp,
    data: parcels,
    lastSync: timestamp
  }));

  broadcastUpdate('SYNC', { timestamp });
};

// Load parcels with sync
export const loadParcelsWithSync = () => {
  const parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
  const syncData = JSON.parse(localStorage.getItem('PARCELS_SYNC') || '{}');

  if (syncData.timestamp > lastSyncTimestamp) {
    lastSyncTimestamp = syncData.timestamp;
    return syncData.data;
  }

  return parcels;
};

// Initialize sync state when module loads
initSyncState(); 