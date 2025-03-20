import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Environment variables with defaults
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // MongoDB configuration
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/grub-auth",

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",

  // Redis configuration
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: parseInt(process.env.REDIS_PORT || "6379", 10),
  redisPassword: process.env.REDIS_PASSWORD || "",

  // Kafka configuration
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "auth-service",
  kafkaGroupId: process.env.KAFKA_GROUP_ID || "auth-service-group",

  // Topics
  userCreatedTopic: process.env.USER_CREATED_TOPIC || "user-created",
  userUpdatedTopic: process.env.USER_UPDATED_TOPIC || "user-updated",

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
};

// Validate required environment variables in production
if (config.nodeEnv === "production") {
  const requiredEnvVars = [
    "MONGO_URI",
    "JWT_SECRET",
    "REDIS_HOST",
    "KAFKA_BROKERS",
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(
        `Environment variable ${envVar} is required in production mode`
      );
    }
  }
}
