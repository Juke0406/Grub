import schedule from "node-schedule";
import { logger } from "../utils/logger";
import { config } from "../config";
import { EventProcessorService } from "./event-processor.service";
import mongoose from "mongoose";

/**
 * Service to handle scheduled tasks
 */
export class SchedulerService {
  private dailyJob: schedule.Job | null = null;
  private weeklyJob: schedule.Job | null = null;
  private eventProcessor: EventProcessorService;

  constructor(eventProcessor: EventProcessorService) {
    this.eventProcessor = eventProcessor;
  }

  /**
   * Initialize the scheduler
   */
  async initialize(): Promise<void> {
    try {
      // Schedule daily predictions
      this.dailyJob = schedule.scheduleJob(
        config.dailyPredictionSchedule,
        async () => {
          logger.info("Running scheduled daily predictions");
          await this.runDailyPredictions();
        }
      );

      // Schedule weekly predictions
      this.weeklyJob = schedule.scheduleJob(
        config.weeklyPredictionSchedule,
        async () => {
          logger.info("Running scheduled weekly predictions");
          await this.runWeeklyPredictions();
        }
      );

      logger.info("Scheduler initialized successfully", {
        dailySchedule: config.dailyPredictionSchedule,
        weeklySchedule: config.weeklyPredictionSchedule,
      });
    } catch (error) {
      logger.error("Failed to initialize scheduler:", error);
      throw error;
    }
  }

  /**
   * Run daily predictions for all businesses
   */
  private async runDailyPredictions(): Promise<void> {
    try {
      // Get all active business IDs
      const businessIds = await this.getActiveBusinessIds();

      if (businessIds.length === 0) {
        logger.warn("No active businesses found for daily predictions");
        return;
      }

      // Trigger daily predictions
      await this.eventProcessor.triggerDailyPredictions(businessIds);
      logger.info(
        `Daily predictions triggered for ${businessIds.length} businesses`
      );
    } catch (error) {
      logger.error("Error running daily predictions:", error);
    }
  }

  /**
   * Run weekly predictions for all businesses
   */
  private async runWeeklyPredictions(): Promise<void> {
    try {
      // Get all active business IDs
      const businessIds = await this.getActiveBusinessIds();

      if (businessIds.length === 0) {
        logger.warn("No active businesses found for weekly predictions");
        return;
      }

      // Trigger weekly predictions
      await this.eventProcessor.triggerWeeklyPredictions(businessIds);
      logger.info(
        `Weekly predictions triggered for ${businessIds.length} businesses`
      );
    } catch (error) {
      logger.error("Error running weekly predictions:", error);
    }
  }

  /**
   * Get all active business IDs
   * This is a placeholder - in a real implementation, you would query the database
   * or call a business service API to get the list of active businesses
   */
  private async getActiveBusinessIds(): Promise<string[]> {
    try {
      // In a real implementation, you would query the database or call a service
      // For now, we'll use an aggregation on the ProductDemand collection to get unique business IDs
      const result = await mongoose.connection.db
        .collection("productdemands")
        .distinct("businessId");
      return result as string[];
    } catch (error) {
      logger.error("Error getting active business IDs:", error);
      return [];
    }
  }

  /**
   * Shutdown the scheduler
   */
  async shutdown(): Promise<void> {
    try {
      if (this.dailyJob) {
        this.dailyJob.cancel();
        logger.info("Daily prediction job cancelled");
      }

      if (this.weeklyJob) {
        this.weeklyJob.cancel();
        logger.info("Weekly prediction job cancelled");
      }

      logger.info("Scheduler shutdown complete");
    } catch (error) {
      logger.error("Error shutting down scheduler:", error);
    }
  }
}
