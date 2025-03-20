import mongoose from "mongoose";
import config from "./config";
import { logger } from "./utils/logger";

/**
 * Connect to MongoDB
 */
export const connectToDatabase = async (): Promise<void> => {
  try {
    // Set mongoose options
    mongoose.set("strictQuery", true);

    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);

    logger.info("Connected to MongoDB successfully");

    // Set up event listeners for connection events
    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
      process.exit(1);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info("Disconnected from MongoDB");
  } catch (error) {
    logger.error(`Error disconnecting from MongoDB: ${error}`);
    throw error;
  }
};
