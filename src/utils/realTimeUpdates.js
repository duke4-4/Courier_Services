export const EVENTS = {
  PARCEL_UPDATED: 'PARCEL_UPDATED',
  PARCEL_CREATED: 'PARCEL_CREATED',
  STATUS_UPDATED: 'STATUS_UPDATED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED'
};

export const broadcastUpdate = (eventType, data) => {
  const event = new CustomEvent('hot-courier-update', {
    detail: { type: eventType, data, timestamp: new Date().toISOString() }
  });
  window.dispatchEvent(event);
  
  // Also store the last update in localStorage to handle cross-tab updates
  localStorage.setItem('lastUpdate', JSON.stringify({
    type: eventType,
    data,
    timestamp: new Date().toISOString()
  }));
};

export const subscribeToUpdates = (callback) => {
  const handleUpdate = (event) => {
    callback(event.detail);
  };

  window.addEventListener('hot-courier-update', handleUpdate);
  window.addEventListener('storage', (e) => {
    if (e.key === 'lastUpdate') {
      const update = JSON.parse(e.newValue);
      callback(update);
    }
  });

  return () => {
    window.removeEventListener('hot-courier-update', handleUpdate);
  };
}; 