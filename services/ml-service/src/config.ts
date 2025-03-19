import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Environment variables with defaults
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || "3005", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // MongoDB configuration
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/grub-ml",

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",

  // Kafka configuration
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "ml-service",
  kafkaGroupId: process.env.KAFKA_GROUP_ID || "ml-service-group",

  // Topics to consume
  productCreatedTopic: process.env.PRODUCT_CREATED_TOPIC || "product-created",
  productUpdatedTopic: process.env.PRODUCT_UPDATED_TOPIC || "product-updated",
  productDeletedTopic: process.env.PRODUCT_DELETED_TOPIC || "product-deleted",
  bundleCreatedTopic: process.env.BUNDLE_CREATED_TOPIC || "bundle-created",
  bundleUpdatedTopic: process.env.BUNDLE_UPDATED_TOPIC || "bundle-updated",
  reservationCreatedTopic:
    process.env.RESERVATION_CREATED_TOPIC || "reservation-created",
  reservationUpdatedTopic:
    process.env.RESERVATION_UPDATED_TOPIC || "reservation-updated",
  reservationCancelledTopic:
    process.env.RESERVATION_CANCELLED_TOPIC || "reservation-cancelled",

  // Topics to produce
  predictionCreatedTopic:
    process.env.PREDICTION_CREATED_TOPIC || "prediction-created",
  recommendationCreatedTopic:
    process.env.RECOMMENDATION_CREATED_TOPIC || "recommendation-created",

  // Redis configuration
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: parseInt(process.env.REDIS_PORT || "6379", 10),
  redisPassword: process.env.REDIS_PASSWORD || "",

  // ML model configuration
  modelUpdateInterval: parseInt(
    process.env.MODEL_UPDATE_INTERVAL || "86400",
    10
  ), // 24 hours in seconds
  predictionHorizon: parseInt(process.env.PREDICTION_HORIZON || "7", 10), // 7 days ahead prediction
  minDataPointsForTraining: parseInt(process.env.MIN_DATA_POINTS || "30", 10), // Minimum data points needed for training
  confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD || "0.7"), // Confidence threshold for predictions

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
