import { createClient, RedisClientType } from "redis";
import config from "./config";
import { logger } from "./utils/logger";

// Redis client
let redisClient: RedisClientType;

/**
 * Initialize Redis connection
 */
export const initializeRedis = async (): Promise<void> => {
  try {
    // Create Redis client
    redisClient = createClient({
      url: `redis://${config.redisPassword ? `:${config.redisPassword}@` : ""}${
        config.redisHost
      }:${config.redisPort}`,
    });

    // Set up event handlers
    redisClient.on("error", (err) => {
      logger.error(`Redis error: ${err}`);
    });

    redisClient.on("connect", () => {
      logger.info("Redis connected successfully");
    });

    redisClient.on("reconnecting", () => {
      logger.warn("Redis reconnecting");
    });

    redisClient.on("end", () => {
      logger.info("Redis connection closed");
    });

    // Connect to Redis
    await redisClient.connect();
  } catch (error) {
    logger.error(`Error connecting to Redis: ${error}`);
    throw error;
  }
};

/**
 * Get Redis client
 */
export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error("Redis client not initialized");
  }
  return redisClient;
};

/**
 * Disconnect from Redis
 */
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info("Redis disconnected");
    }
  } catch (error) {
    logger.error(`Error disconnecting from Redis: ${error}`);
    throw error;
  }
};

/**
 * Store API key in Redis cache
 */
export const cacheApiKey = async (
  key: string,
  userId: string,
  expiresAt: Date
): Promise<void> => {
  try {
    const redisKey = `api_key:${key}`;
    const value = JSON.stringify({
      userId,
      expiresAt: expiresAt.toISOString(),
    });

    // Calculate TTL in seconds
    const ttlSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

    if (ttlSeconds <= 0) {
      logger.warn(`API key ${key} has already expired, not caching`);
      return;
    }

    await redisClient.set(redisKey, value, { EX: ttlSeconds });
    logger.info(`API key ${key} cached successfully`);
  } catch (error) {
    logger.error(`Error caching API key: ${error}`);
    throw error;
  }
};

/**
 * Get API key from Redis cache
 */
export const getApiKeyFromCache = async (
  key: string
): Promise<{ userId: string; expiresAt: string } | null> => {
  try {
    const redisKey = `api_key:${key}`;
    const value = await redisClient.get(redisKey);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (error) {
    logger.error(`Error getting API key from cache: ${error}`);
    return null;
  }
};

/**
 * Remove API key from Redis cache
 */
export const removeApiKeyFromCache = async (key: string): Promise<void> => {
  try {
    const redisKey = `api_key:${key}`;
    await redisClient.del(redisKey);
    logger.info(`API key ${key} removed from cache`);
  } catch (error) {
    logger.error(`Error removing API key from cache: ${error}`);
    throw error;
  }
};

/**
 * Increment API key usage count in Redis
 */
export const incrementApiKeyUsage = async (key: string): Promise<number> => {
  try {
    const redisKey = `api_key_usage:${key}`;
    const count = await redisClient.incr(redisKey);

    // Set expiry to 24 hours if this is the first increment
    if (count === 1) {
      await redisClient.expire(redisKey, 24 * 60 * 60);
    }

    return count;
  } catch (error) {
    logger.error(`Error incrementing API key usage: ${error}`);
    throw error;
  }
};

/**
 * Get API key usage count from Redis
 */
export const getApiKeyUsage = async (key: string): Promise<number> => {
  try {
    const redisKey = `api_key_usage:${key}`;
    const count = await redisClient.get(redisKey);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    logger.error(`Error getting API key usage: ${error}`);
    return 0;
  }
};
