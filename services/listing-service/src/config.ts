import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Environment variables with defaults
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || "3003", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // MongoDB configuration
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/grub-listing",

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",

  // Kafka configuration
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "listing-service",
  kafkaGroupId: process.env.KAFKA_GROUP_ID || "listing-service-group",

  // Topics
  productCreatedTopic: process.env.PRODUCT_CREATED_TOPIC || "product-created",
  productUpdatedTopic: process.env.PRODUCT_UPDATED_TOPIC || "product-updated",
  productDeletedTopic: process.env.PRODUCT_DELETED_TOPIC || "product-deleted",
  categoryCreatedTopic:
    process.env.CATEGORY_CREATED_TOPIC || "category-created",
  categoryUpdatedTopic:
    process.env.CATEGORY_UPDATED_TOPIC || "category-updated",
  bundleCreatedTopic: process.env.BUNDLE_CREATED_TOPIC || "bundle-created",
  bundleUpdatedTopic: process.env.BUNDLE_UPDATED_TOPIC || "bundle-updated",

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
