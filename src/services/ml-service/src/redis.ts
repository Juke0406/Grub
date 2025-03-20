import { createClient, RedisClientType } from "redis";
import { config } from "./config";
import { logger } from "./utils/logger";

// Redis client instance
let redisClient: RedisClientType;

/**
 * Connect to Redis
 */
export const connectToRedis = async (): Promise<void> => {
  try {
    // Create Redis client
    redisClient = createClient({
      url: `redis://${config.redisPassword ? `:${config.redisPassword}@` : ""}${
        config.redisHost
      }:${config.redisPort}`,
    });

    // Set up event handlers
    redisClient.on("error", (err) => {
      logger.error("Redis client error:", err);
    });

    redisClient.on("connect", () => {
      logger.info("Connected to Redis");
    });

    redisClient.on("reconnecting", () => {
      logger.warn("Redis client reconnecting");
    });

    redisClient.on("ready", () => {
      logger.info("Redis client ready");
    });

    // Connect to Redis
    await redisClient.connect();
  } catch (error) {
    logger.error("Failed to connect to Redis:", error);
    throw error;
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error("Redis client not initialized");
  }
  return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedisConnection = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info("Redis connection closed");
    }
  } catch (error) {
    logger.error("Error closing Redis connection:", error);
    throw error;
  }
};

/**
 * Store a key-value pair in Redis with expiration
 */
export const setWithExpiry = async (
  key: string,
  value: string,
  expiryInSeconds: number
): Promise<void> => {
  await getRedisClient().set(key, value, { EX: expiryInSeconds });
};

/**
 * Get a value from Redis by key
 */
export const getValue = async (key: string): Promise<string | null> => {
  return await getRedisClient().get(key);
};

/**
 * Delete a key from Redis
 */
export const deleteKey = async (key: string): Promise<void> => {
  await getRedisClient().del(key);
};

/**
 * Cache ML model data
 */
export const cacheModel = async (
  modelId: string,
  modelData: any,
  expiryInSeconds: number = 86400 // 24 hours by default
): Promise<void> => {
  await setWithExpiry(
    `ml:model:${modelId}`,
    JSON.stringify(modelData),
    expiryInSeconds
  );
};

/**
 * Get cached ML model data
 */
export const getCachedModel = async (modelId: string): Promise<any | null> => {
  const data = await getValue(`ml:model:${modelId}`);
  return data ? JSON.parse(data) : null;
};

/**
 * Cache prediction data
 */
export const cachePrediction = async (
  predictionId: string,
  predictionData: any,
  expiryInSeconds: number = 3600 // 1 hour by default
): Promise<void> => {
  await setWithExpiry(
    `ml:prediction:${predictionId}`,
    JSON.stringify(predictionData),
    expiryInSeconds
  );
};

/**
 * Get cached prediction data
 */
export const getCachedPrediction = async (
  predictionId: string
): Promise<any | null> => {
  const data = await getValue(`ml:prediction:${predictionId}`);
  return data ? JSON.parse(data) : null;
};

/**
 * Cache business recommendation data
 */
export const cacheRecommendation = async (
  businessId: string,
  recommendationData: any,
  expiryInSeconds: number = 43200 // 12 hours by default
): Promise<void> => {
  await setWithExpiry(
    `ml:recommendation:${businessId}`,
    JSON.stringify(recommendationData),
    expiryInSeconds
  );
};

/**
 * Get cached business recommendation data
 */
export const getCachedRecommendation = async (
  businessId: string
): Promise<any | null> => {
  const data = await getValue(`ml:recommendation:${businessId}`);
  return data ? JSON.parse(data) : null;
};
