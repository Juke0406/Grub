import express from "express";
import cors from "cors";
import { config } from "./config";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/error.middleware";
import { connectToDatabase } from "./database";
import { connectToRedis } from "./redis";
import { setupKafkaProducer } from "./kafka";
import { logger } from "./utils/logger";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "auth-service" });
});

// Routes
app.use("/api/auth/v1", authRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    logger.info("Connected to MongoDB");

    // Connect to Redis
    await connectToRedis();
    logger.info("Connected to Redis");

    // Setup Kafka producer
    await setupKafkaProducer();
    logger.info("Connected to Kafka");

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`Auth service running on port ${config.port}`);
    });
  } catch (error) {
    logger.error("Failed to start auth service:", error);
    process.exit(1);
  }
};

start();

// Handle graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});
