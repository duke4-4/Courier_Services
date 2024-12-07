const SYNC_URL = 'https://your-sync-api.vercel.app/api/sync';

export const syncWithServer = async (data) => {
  try {
    const response = await fetch(SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('Sync error:', error);
    return null;
  }
};

export const getServerData = async () => {
  try {
    const response = await fetch(SYNC_URL);
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}; 