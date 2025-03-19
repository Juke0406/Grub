import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config";
import { logger } from "./utils/logger";
import { connectToDatabase } from "./database";
import { initProducer } from "./kafka";
import { connectToRedis } from "./redis";
import { errorMiddleware } from "./middleware/error.middleware";
import creationRoutes from "./routes/creation.routes";

// Initialize Express app
const app = express();

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", creationRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "creation-service" });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    logger.info("Connected to MongoDB");

    // Connect to Redis
    await connectToRedis();
    logger.info("Connected to Redis");

    // Initialize Kafka producer
    await initProducer();
    logger.info("Initialized Kafka producer");

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`Creation service running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled rejection", { reason, promise });
  process.exit(1);
});

// Start the server
startServer();
