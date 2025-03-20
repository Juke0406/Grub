import {
  Recommendation,
  IRecommendation,
  RecommendationType,
  RecommendationStatus,
} from "../models/recommendation.model";
import { ModelType } from "../models/ml-model.model";
import { predictionService } from "./prediction.service";
import { logger } from "../utils/logger";
import { cacheRecommendation, getCachedRecommendation } from "../redis";
import { produceMessage } from "../kafka";
import { config } from "../config";
import * as schedule from "node-schedule";

/**
 * Service for managing business recommendations
 */
export class RecommendationService {
  private scheduledJobs: Map<string, schedule.Job> = new Map();

  /**
   * Initialize recommendation service
   */
  initialize(): void {
    // Schedule daily recommendation generation
    const dailyJob = schedule.scheduleJob("0 1 * * *", async () => {
      try {
        logger.info("Starting daily recommendation generation");
        await this.generateDailyRecommendations();
        logger.info("Completed daily recommendation generation");
      } catch (error) {
        logger.error("Error in daily recommendation generation", { error });
      }
    });

    this.scheduledJobs.set("dailyRecommendations", dailyJob);

    // Schedule weekly recommendation generation
    const weeklyJob = schedule.scheduleJob("0 2 * * 1", async () => {
      try {
        logger.info("Starting weekly recommendation generation");
        await this.generateWeeklyRecommendations();
        logger.info("Completed weekly recommendation generation");
      } catch (error) {
        logger.error("Error in weekly recommendation generation", { error });
      }
    });

    this.scheduledJobs.set("weeklyRecommendations", weeklyJob);

    logger.info("Recommendation service initialized");
  }

  /**
   * Shutdown recommendation service
   */
  shutdown(): void {
    // Cancel all scheduled jobs
    for (const [name, job] of this.scheduledJobs.entries()) {
      job.cancel();
      logger.info(`Cancelled scheduled job: ${name}`);
    }

    this.scheduledJobs.clear();
    logger.info("Recommendation service shutdown");
  }

  /**
   * Create a new recommendation
   */
  async createRecommendation(
    recommendationData: Partial<IRecommendation>
  ): Promise<IRecommendation> {
    try {
      const recommendation = new Recommendation(recommendationData);
      await recommendation.save();

      // Cache the recommendation
      await cacheRecommendation(
        recommendation.businessId.toString(),
        recommendation.toObject()
      );

      // Publish recommendation created event
      await produceMessage(config.recommendationCreatedTopic, {
        recommendationId: recommendation._id,
        businessId: recommendation.businessId,
        type: recommendation.type,
        title: recommendation.title,
        description: recommendation.description,
      });

      logger.info(`Created new recommendation: ${recommendation.title}`, {
        recommendationId: recommendation._id,
        businessId: recommendation.businessId,
        type: recommendation.type,
      });

      return recommendation;
    } catch (error) {
      logger.error("Error creating recommendation", {
        error,
        recommendationData,
      });
      throw error;
    }
  }

  /**
   * Get recommendation by ID
   */
  async getRecommendationById(
    recommendationId: string
  ): Promise<IRecommendation | null> {
    try {
      const recommendation = await Recommendation.findById(recommendationId);
      return recommendation;
    } catch (error) {
      logger.error("Error getting recommendation by ID", {
        error,
        recommendationId,
      });
      throw error;
    }
  }

  /**
   * Get active recommendations for a business
   */
  async getActiveRecommendationsForBusiness(
    businessId: string
  ): Promise<IRecommendation[]> {
    try {
      // Try to get from cache first
      const cachedRecommendations = await getCachedRecommendation(businessId);
      if (cachedRecommendations) {
        return cachedRecommendations as unknown as IRecommendation[];
      }

      // If not in cache, get from database
      const recommendations = await Recommendation.find({
        businessId,
        status: RecommendationStatus.ACTIVE,
        expiresAt: { $gt: new Date() },
      }).sort({ confidence: -1 });

      // Cache the recommendations if found
      if (recommendations.length > 0) {
        await cacheRecommendation(
          businessId,
          recommendations.map((r) => r.toObject())
        );
      }

      return recommendations;
    } catch (error) {
      logger.error("Error getting active recommendations for business", {
        error,
        businessId,
      });
      throw error;
    }
  }

  /**
   * Update recommendation status
   */
  async updateRecommendationStatus(
    recommendationId: string,
    status: RecommendationStatus,
    reason?: string
  ): Promise<IRecommendation | null> {
    try {
      const recommendation = await Recommendation.findById(recommendationId);

      if (!recommendation) {
        return null;
      }

      recommendation.status = status;

      if (status === RecommendationStatus.IMPLEMENTED) {
        recommendation.implementedAt = new Date();
      } else if (status === RecommendationStatus.DISMISSED) {
        recommendation.dismissedAt = new Date();
        recommendation.dismissReason = reason || "No reason provided";
      }

      await recommendation.save();

      // Invalidate cache
      await cacheRecommendation(recommendation.businessId.toString(), null, 0);

      logger.info(
        `Updated recommendation status to ${status}: ${recommendation.title}`,
        {
          recommendationId,
          businessId: recommendation.businessId,
          status,
        }
      );

      return recommendation;
    } catch (error) {
      logger.error("Error updating recommendation status", {
        error,
        recommendationId,
        status,
      });
      throw error;
    }
  }

  /**
   * Generate daily recommendations for all businesses
   */
  private async generateDailyRecommendations(): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Query all businesses
      // 2. For each business, analyze recent data
      // 3. Generate appropriate recommendations

      // This is a placeholder implementation
      logger.info("Daily recommendation generation not implemented yet");
    } catch (error) {
      logger.error("Error generating daily recommendations", { error });
      throw error;
    }
  }

  /**
   * Generate weekly recommendations for all businesses
   */
  private async generateWeeklyRecommendations(): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Query all businesses
      // 2. For each business, analyze weekly data
      // 3. Generate appropriate recommendations

      // This is a placeholder implementation
      logger.info("Weekly recommendation generation not implemented yet");
    } catch (error) {
      logger.error("Error generating weekly recommendations", { error });
      throw error;
    }
  }

  /**
   * Generate inventory recommendations for a business
   */
  async generateInventoryRecommendations(
    businessId: string
  ): Promise<IRecommendation[]> {
    try {
      // Get inventory prediction
      const prediction = await predictionService.createPrediction(
        businessId,
        ModelType.INVENTORY_FORECAST,
        {
          forecastPeriod: "weekly",
          // Additional input data would be provided here
        },
        businessId,
        "business"
      );

      // Wait for prediction to complete
      const completedPrediction = await this.waitForPrediction(
        prediction._id.toString()
      );

      if (!completedPrediction || !completedPrediction.predictionResult) {
        throw new Error("Failed to generate inventory prediction");
      }

      const result = completedPrediction.predictionResult;

      // Create inventory recommendation
      const recommendation = await this.createRecommendation({
        businessId: businessId as any,
        type: RecommendationType.INVENTORY,
        title: "Optimize your inventory levels",
        description: `Based on our analysis, we recommend adjusting your inventory levels to optimize storage and reduce waste.`,
        details: {
          predictedInventory: result.predictedInventory,
          reorderPoint: result.reorderPoint,
          safetyStock: result.safetyStock,
          forecastPeriod: result.forecastPeriod,
          keyFactors: result.factors,
        },
        potentialImpact: [
          {
            metric: "Waste Reduction",
            value: 15,
            unit: "%",
          },
          {
            metric: "Storage Cost",
            value: 10,
            unit: "%",
          },
        ],
        confidence: completedPrediction.confidence,
        status: RecommendationStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return [recommendation];
    } catch (error) {
      logger.error("Error generating inventory recommendations", {
        error,
        businessId,
      });
      throw error;
    }
  }

  /**
   * Generate pricing recommendations for a business
   */
  async generatePricingRecommendations(
    businessId: string
  ): Promise<IRecommendation[]> {
    try {
      // Get price optimization prediction
      const prediction = await predictionService.createPrediction(
        businessId,
        ModelType.PRICE_OPTIMIZATION,
        {
          // Input data would be provided here
        },
        businessId,
        "business"
      );

      // Wait for prediction to complete
      const completedPrediction = await this.waitForPrediction(
        prediction._id.toString()
      );

      if (!completedPrediction || !completedPrediction.predictionResult) {
        throw new Error("Failed to generate pricing prediction");
      }

      const result = completedPrediction.predictionResult;

      // Create pricing recommendation
      const recommendation = await this.createRecommendation({
        businessId: businessId as any,
        type: RecommendationType.PRICING,
        title: "Optimize your pricing strategy",
        description: `Our analysis suggests adjusting your pricing strategy to maximize revenue while maintaining competitive prices.`,
        details: {
          optimalPrice: result.optimalPrice,
          optimalDiscount: result.optimalDiscount,
          estimatedDemandIncrease: result.estimatedDemandIncrease,
          keyFactors: result.factors,
        },
        potentialImpact: [
          {
            metric: "Revenue",
            value: 8,
            unit: "%",
          },
          {
            metric: "Sales Volume",
            value: result.estimatedDemandIncrease,
            unit: "%",
          },
        ],
        confidence: completedPrediction.confidence,
        status: RecommendationStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      });

      return [recommendation];
    } catch (error) {
      logger.error("Error generating pricing recommendations", {
        error,
        businessId,
      });
      throw error;
    }
  }

  /**
   * Generate expiry management recommendations for a business
   */
  async generateExpiryRecommendations(
    businessId: string
  ): Promise<IRecommendation[]> {
    try {
      // Get expiry prediction
      const prediction = await predictionService.createPrediction(
        businessId,
        ModelType.EXPIRY_PREDICTION,
        {
          // Input data would be provided here
        },
        businessId,
        "business"
      );

      // Wait for prediction to complete
      const completedPrediction = await this.waitForPrediction(
        prediction._id.toString()
      );

      if (!completedPrediction || !completedPrediction.predictionResult) {
        throw new Error("Failed to generate expiry prediction");
      }

      const result = completedPrediction.predictionResult;

      // Create expiry management recommendation
      const recommendation = await this.createRecommendation({
        businessId: businessId as any,
        type: RecommendationType.EXPIRY_MANAGEMENT,
        title: "Reduce food waste with dynamic discounting",
        description: `Implement dynamic discounting for products approaching expiry to minimize waste and maximize revenue.`,
        details: {
          expiryRisk: result.expiryRisk,
          daysUntilExpiry: result.daysUntilExpiry,
          recommendedDiscount: result.recommendedDiscount,
          keyFactors: result.factors,
        },
        potentialImpact: [
          {
            metric: "Waste Reduction",
            value: 30,
            unit: "%",
          },
          {
            metric: "Revenue Recovery",
            value: 20,
            unit: "%",
          },
        ],
        confidence: completedPrediction.confidence,
        status: RecommendationStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      });

      return [recommendation];
    } catch (error) {
      logger.error("Error generating expiry recommendations", {
        error,
        businessId,
      });
      throw error;
    }
  }

  /**
   * Wait for a prediction to complete
   */
  private async waitForPrediction(
    predictionId: string,
    maxAttempts = 10,
    delayMs = 1000
  ): Promise<any> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const prediction = await predictionService.getPredictionById(
        predictionId
      );

      if (!prediction) {
        throw new Error(`Prediction not found: ${predictionId}`);
      }

      if (prediction.status === "completed") {
        return prediction;
      }

      if (prediction.status === "failed") {
        throw new Error(
          `Prediction failed: ${prediction.errorMessage || "Unknown error"}`
        );
      }

      // Wait before checking again
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      attempts++;
    }

    throw new Error(`Prediction timed out after ${maxAttempts} attempts`);
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
