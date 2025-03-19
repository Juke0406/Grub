import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Environment variables with defaults
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || "3005", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // MongoDB configuration
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/grub-creation",

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",

  // Kafka configuration
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "creation-service",
  kafkaGroupId: process.env.KAFKA_GROUP_ID || "creation-service-group",

  // Topics
  productCreatedTopic: process.env.PRODUCT_CREATED_TOPIC || "product-created",
  productUpdatedTopic: process.env.PRODUCT_UPDATED_TOPIC || "product-updated",
  productDeletedTopic: process.env.PRODUCT_DELETED_TOPIC || "product-deleted",
  bundleCreatedTopic: process.env.BUNDLE_CREATED_TOPIC || "bundle-created",
  bundleUpdatedTopic: process.env.BUNDLE_UPDATED_TOPIC || "bundle-updated",
  categoryCreatedTopic:
    process.env.CATEGORY_CREATED_TOPIC || "category-created",
  categoryUpdatedTopic:
    process.env.CATEGORY_UPDATED_TOPIC || "category-updated",
  businessOnboardedTopic:
    process.env.BUSINESS_ONBOARDED_TOPIC || "business-onboarded",
  businessUpdatedTopic:
    process.env.BUSINESS_UPDATED_TOPIC || "business-updated",

  // Redis configuration (if needed)
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: parseInt(process.env.REDIS_PORT || "6379", 10),
  redisPassword: process.env.REDIS_PASSWORD || "",

  // File storage configuration
  storageType: process.env.STORAGE_TYPE || "local", // 'local', 's3', 'gcs', etc.
  localStoragePath: process.env.LOCAL_STORAGE_PATH || "./uploads",
  // Cloud storage config (if used)
  cloudStorageBucket: process.env.CLOUD_STORAGE_BUCKET || "",
  cloudStorageRegion: process.env.CLOUD_STORAGE_REGION || "",

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
};

// Validate required environment variables in production
if (config.nodeEnv === "production") {
  const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "KAFKA_BROKERS"];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(
        `Environment variable ${envVar} is required in production mode`
      );
    }
  }
}
