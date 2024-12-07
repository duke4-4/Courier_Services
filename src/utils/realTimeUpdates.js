export const EVENTS = {
  PARCEL_UPDATED: 'PARCEL_UPDATED',
  PARCEL_CREATED: 'PARCEL_CREATED',
  STATUS_UPDATED: 'STATUS_UPDATED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED'
};

export const broadcastUpdate = (eventType, data) => {
  // Create the update object
  const update = {
    type: eventType,
    data,
    timestamp: new Date().toISOString()
  };

  // Store the update in localStorage
  localStorage.setItem('lastUpdate', JSON.stringify(update));

  // Dispatch event for same-window updates
  const event = new CustomEvent('hot-courier-update', { detail: update });
  window.dispatchEvent(event);

  // Store last update timestamp
  localStorage.setItem('lastUpdateTime', new Date().toISOString());
};

export const subscribeToUpdates = (callback) => {
  let lastCheck = new Date().toISOString();

  // Handle same-window updates
  const handleUpdate = (event) => {
    callback(event.detail);
  };

  // Handle cross-window/tab updates
  const handleStorageChange = (e) => {
    if (e.key === 'lastUpdate' && e.newValue) {
      const update = JSON.parse(e.newValue);
      callback(update);
    }
  };

  // Poll for updates every 5 seconds
  const pollInterval = setInterval(() => {
    const lastUpdateTime = localStorage.getItem('lastUpdateTime');
    if (lastUpdateTime && lastUpdateTime > lastCheck) {
      const update = JSON.parse(localStorage.getItem('lastUpdate'));
      callback(update);
      lastCheck = lastUpdateTime;
    }
  }, 5000);

  window.addEventListener('hot-courier-update', handleUpdate);
  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('hot-courier-update', handleUpdate);
    window.removeEventListener('storage', handleStorageChange);
    clearInterval(pollInterval);
  };
}; 