import mongoose from "mongoose";
import { config } from "./config";
import { logger } from "./utils/logger";

// MongoDB connection options
const mongooseOptions: mongoose.ConnectOptions = {
  // These options help ensure a stable connection
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/**
 * Connect to MongoDB database
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoUri, mongooseOptions);

    // Log successful connection
    logger.info("Connected to MongoDB database");

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected, attempting to reconnect");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};

/**
 * Close MongoDB connection
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed");
  } catch (error) {
    logger.error("Error closing MongoDB connection:", error);
    throw error;
  }
};
