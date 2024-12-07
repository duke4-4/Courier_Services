import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { type, update, parcels, timestamp } = req.body;
    
    // Store the update
    await redis.set('parcels', JSON.stringify(parcels));
    await redis.set('lastUpdate', timestamp);

    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    const parcels = JSON.parse(await redis.get('parcels') || '[]');
    const timestamp = await redis.get('lastUpdate');

    return res.status(200).json({
      parcels,
      timestamp: Number(timestamp) || Date.now()
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 