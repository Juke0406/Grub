import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Environment variables with defaults
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || "3002", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // MongoDB configuration
  mongoUri:
    process.env.MONGO_URI || "mongodb://localhost:27017/grub-reservation",

  // JWT configuration for token verification
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",

  // Kafka configuration
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "reservation-service",
  kafkaGroupId: process.env.KAFKA_GROUP_ID || "reservation-service-group",

  // Topics
  reservationCreatedTopic:
    process.env.RESERVATION_CREATED_TOPIC || "reservation-created",
  reservationUpdatedTopic:
    process.env.RESERVATION_UPDATED_TOPIC || "reservation-updated",
  reservationCancelledTopic:
    process.env.RESERVATION_CANCELLED_TOPIC || "reservation-cancelled",
  productUpdatedTopic: process.env.PRODUCT_UPDATED_TOPIC || "product-updated",

  // Consumer topics
  userCreatedTopic: process.env.USER_CREATED_TOPIC || "user-created",
  userUpdatedTopic: process.env.USER_UPDATED_TOPIC || "user-updated",
  productCreatedTopic: process.env.PRODUCT_CREATED_TOPIC || "product-created",

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
