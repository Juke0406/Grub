import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Server configuration
const config = {
  // Server settings
  port: parseInt(process.env.PORT || "3007", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // MongoDB settings
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/grub-api",

  // JWT settings
  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",

  // Redis settings
  redisHost: process.env.REDIS_HOST || "localhost",
  redisPort: parseInt(process.env.REDIS_PORT || "6379", 10),
  redisPassword: process.env.REDIS_PASSWORD || "",

  // Kafka settings
  kafkaBrokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || "api-service",
  kafkaGroupId: process.env.KAFKA_GROUP_ID || "api-service-group",

  // Kafka topics
  apiKeyCreatedTopic: process.env.API_KEY_CREATED_TOPIC || "api-key-created",
  apiKeyDeletedTopic: process.env.API_KEY_DELETED_TOPIC || "api-key-deleted",
  apiKeyUpdatedTopic: process.env.API_KEY_UPDATED_TOPIC || "api-key-updated",

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
  rateLimitMaxRequests: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10
  ),
  rateLimitStandardTier: parseInt(
    process.env.RATE_LIMIT_STANDARD_TIER || "100",
    10
  ),
  rateLimitPremiumTier: parseInt(
    process.env.RATE_LIMIT_PREMIUM_TIER || "500",
    10
  ),
  rateLimitEnterpriseTier: parseInt(
    process.env.RATE_LIMIT_ENTERPRISE_TIER || "1000",
    10
  ),

  // Swagger documentation
  swagger: {
    title: process.env.SWAGGER_TITLE || "Grub API Service",
    description:
      process.env.SWAGGER_DESCRIPTION ||
      "API Gateway and Management Service for Grub",
    version: process.env.SWAGGER_VERSION || "1.0.0",
    serverUrl: process.env.SWAGGER_SERVER_URL || "http://localhost:3007",
  },
};

// Validate required environment variables in production
if (config.nodeEnv === "production") {
  const requiredEnvVars = [
    "PORT",
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

export default config;
