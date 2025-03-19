import express from "express";
import cors from "cors";
import { config } from "./config";
import predictionRoutes from "./routes/prediction.routes";
import { errorHandler } from "./middleware/error.middleware";
import { connectToDatabase } from "./database";
import { setupKafkaProducer, disconnectKafkaProducer } from "./kafka";
import { logger } from "./utils/logger";
import { EventProcessorService } from "./services/event-processor.service";
import { SchedulerService } from "./services/scheduler.service";

// Initialize Express app
const app = express();

// Initialize services
const eventProcessor = new EventProcessorService();
const scheduler = new SchedulerService(eventProcessor);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "prediction-service" });
});

// Routes
app.use("/api/predictions/v1", predictionRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    logger.info("Connected to MongoDB");

    // Setup Kafka producer
    await setupKafkaProducer();
    logger.info("Connected to Kafka producer");

    // Initialize event processor
    await eventProcessor.initialize();
    logger.info("Event processor initialized");

    // Initialize scheduler
    await scheduler.initialize();
    logger.info("Scheduler initialized");

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`Prediction service running on port ${config.port}`);
    });
  } catch (error) {
    logger.error("Failed to start prediction service:", error);
    process.exit(1);
  }
};

start();

// Handle graceful shutdown
const gracefulShutdown = async () => {
  logger.info("Shutting down gracefully...");

  try {
    // Shutdown scheduler
    await scheduler.shutdown();
    logger.info("Scheduler shutdown complete");

    // Shutdown event processor
    await eventProcessor.shutdown();
    logger.info("Event processor shutdown complete");

    // Disconnect Kafka producer
    await disconnectKafkaProducer();
    logger.info("Kafka producer disconnected");

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
