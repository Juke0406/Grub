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
