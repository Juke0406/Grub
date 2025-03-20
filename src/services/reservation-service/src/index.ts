import express from "express";
import cors from "cors";
import { config } from "./config";
import reservationRoutes from "./routes/reservation.routes";
import { errorHandler } from "./middleware/error.middleware";
import { connectToDatabase } from "./database";
import { setupKafkaProducer, setupKafkaConsumer } from "./kafka";
import { logger } from "./utils/logger";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "reservation-service" });
});

// Routes
app.use("/api/reservations/v1", reservationRoutes);

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

    // Setup Kafka consumer
    await setupKafkaConsumer();
    logger.info("Connected to Kafka consumer");

    // Start Express server
    app.listen(config.port, () => {
      logger.info(`Reservation service running on port ${config.port}`);
    });
  } catch (error) {
    logger.error("Failed to start reservation service:", error);
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
