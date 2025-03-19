import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectToDatabase, disconnectFromDatabase } from "./database";
import { initializeRedis, disconnectRedis } from "./redis";
import {
  initializeKafkaProducer,
  initializeKafkaConsumer,
  disconnectKafka,
} from "./kafka";
import apiRoutes from "./routes/api.routes";
import config from "./config";
import { logger, logStream } from "./utils/logger";
import { setupSwagger } from "./utils/swagger";

// Create Express app
const app = express();

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("combined", { stream: logStream })); // Request logging

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "api-service" });
});

// API routes
app.use("/api/v1", apiRoutes);

// Set up Swagger documentation
setupSwagger(app);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.stack}`);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Initialize services and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Initialize Redis
    await initializeRedis();

    // Initialize Kafka producer
    await initializeKafkaProducer();

    // Initialize Kafka consumer
    await initializeKafkaConsumer();

    // Start Express server
    const server = app.listen(config.port, () => {
      logger.info(
        `API service running on port ${config.port} in ${config.nodeEnv} mode`
      );
    });

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      logger.info("Shutting down gracefully...");

      // Close server
      server.close(() => {
        logger.info("HTTP server closed");
      });

      // Disconnect from services
      try {
        await disconnectKafka();
        await disconnectRedis();
        await disconnectFromDatabase();
        logger.info("All connections closed");
        process.exit(0);
      } catch (error) {
        logger.error(`Error during shutdown: ${error}`);
        process.exit(1);
      }
    };

    // Listen for termination signals
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

// Start the server
startServer();
