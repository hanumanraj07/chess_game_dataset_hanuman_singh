const { createClient } = require('redis');

let redisClient = null;
let subClient = null;
let isRedisConnected = false;

// Create defensive Redis client
const connectRedis = async () => {
  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
      });
      
      subClient = redisClient.duplicate();

      redisClient.on('error', (err) => {
        console.warn('Redis connection error (ignoring and bypassing cache):', err.message);
        isRedisConnected = false;
      });

      redisClient.on('connect', () => {
        console.log('Redis connected successfully.');
        isRedisConnected = true;
      });

      await redisClient.connect();
      await subClient.connect();
    } catch (err) {
      console.warn('Could not connect to Redis, starting without cache layer.');
      isRedisConnected = false;
    }
  } else {
    console.log('No Redis configuration found, starting without cache layer.');
  }
};

const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

const setCache = async (key, value, expSeconds = 3600) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    await redisClient.setEx(key, expSeconds, JSON.stringify(value));
  } catch (err) {
    // silently fail
  }
};

const clearCachePrefix = async (prefix) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    const keys = await redisClient.keys(`${prefix}*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    // silently fail
  }
};

module.exports = {
  connectRedis,
  getCache,
  setCache,
  clearCachePrefix,
  redisClient,
  subClient,
};
