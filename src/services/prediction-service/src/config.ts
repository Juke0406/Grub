import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Environment variables with defaults
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || "3004", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // MongoDB configuration
  mongoUri:
    process.env.MONGO_URI || "mongodb://localhost:27017/grub-prediction",

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",

  // Kafka configuration
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "prediction-service",
  kafkaGroupId: process.env.KAFKA_GROUP_ID || "prediction-service-group",

  // Topics
  reservationCreatedTopic:
    process.env.RESERVATION_CREATED_TOPIC || "reservation-created",
  reservationUpdatedTopic:
    process.env.RESERVATION_UPDATED_TOPIC || "reservation-updated",
  reservationCancelledTopic:
    process.env.RESERVATION_CANCELLED_TOPIC || "reservation-cancelled",
  productCreatedTopic: process.env.PRODUCT_CREATED_TOPIC || "product-created",
  productUpdatedTopic: process.env.PRODUCT_UPDATED_TOPIC || "product-updated",
  productDeletedTopic: process.env.PRODUCT_DELETED_TOPIC || "product-deleted",
  predictionGeneratedTopic:
    process.env.PREDICTION_GENERATED_TOPIC || "prediction-generated",

  // ML Service connection
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://localhost:3006/api/ml/v1",

  // Prediction schedule (cron format)
  dailyPredictionSchedule: process.env.DAILY_PREDICTION_SCHEDULE || "0 0 * * *", // Run at midnight every day
  weeklyPredictionSchedule:
    process.env.WEEKLY_PREDICTION_SCHEDULE || "0 0 * * 0", // Run at midnight every Sunday

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
};

// Validate required environment variables in production
if (config.nodeEnv === "production") {
  const requiredEnvVars = [
    "MONGO_URI",
    "JWT_SECRET",
    "KAFKA_BROKERS",
    "ML_SERVICE_URL",
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(
        `Environment variable ${envVar} is required in production mode`
      );
    }
  }
}
