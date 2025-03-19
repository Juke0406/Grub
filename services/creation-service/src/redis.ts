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
 * Cache product data
 */
export const cacheProduct = async (
  productId: string,
  productData: any
): Promise<void> => {
  await setWithExpiry(
    `product:${productId}`,
    JSON.stringify(productData),
    3600 // 1 hour cache
  );
};

/**
 * Cache bundle data
 */
export const cacheBundle = async (
  bundleId: string,
  bundleData: any
): Promise<void> => {
  await setWithExpiry(
    `bundle:${bundleId}`,
    JSON.stringify(bundleData),
    3600 // 1 hour cache
  );
};

/**
 * Cache category data
 */
export const cacheCategory = async (
  categoryId: string,
  categoryData: any
): Promise<void> => {
  await setWithExpiry(
    `category:${categoryId}`,
    JSON.stringify(categoryData),
    7200 // 2 hour cache
  );
};

/**
 * Cache business data
 */
export const cacheBusiness = async (
  businessId: string,
  businessData: any
): Promise<void> => {
  await setWithExpiry(
    `business:${businessId}`,
    JSON.stringify(businessData),
    7200 // 2 hour cache
  );
};

/**
 * Get cached product data
 */
export const getCachedProduct = async (
  productId: string
): Promise<any | null> => {
  const data = await getValue(`product:${productId}`);
  return data ? JSON.parse(data) : null;
};

/**
 * Get cached bundle data
 */
export const getCachedBundle = async (
  bundleId: string
): Promise<any | null> => {
  const data = await getValue(`bundle:${bundleId}`);
  return data ? JSON.parse(data) : null;
};

/**
 * Get cached category data
 */
export const getCachedCategory = async (
  categoryId: string
): Promise<any | null> => {
  const data = await getValue(`category:${categoryId}`);
  return data ? JSON.parse(data) : null;
};

/**
 * Get cached business data
 */
export const getCachedBusiness = async (
  businessId: string
): Promise<any | null> => {
  const data = await getValue(`business:${businessId}`);
  return data ? JSON.parse(data) : null;
};

/**
 * Invalidate product cache
 */
export const invalidateProductCache = async (
  productId: string
): Promise<void> => {
  await deleteKey(`product:${productId}`);
};

/**
 * Invalidate bundle cache
 */
export const invalidateBundleCache = async (
  bundleId: string
): Promise<void> => {
  await deleteKey(`bundle:${bundleId}`);
};

/**
 * Invalidate category cache
 */
export const invalidateCategoryCache = async (
  categoryId: string
): Promise<void> => {
  await deleteKey(`category:${categoryId}`);
};

/**
 * Invalidate business cache
 */
export const invalidateBusinessCache = async (
  businessId: string
): Promise<void> => {
  await deleteKey(`business:${businessId}`);
};
