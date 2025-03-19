import { Request, Response, NextFunction } from "express";
import { recommendationService } from "../services/recommendation.service";
import {
  RecommendationStatus,
  RecommendationType,
} from "../models/recommendation.model";
import { logger } from "../utils/logger";
import { ApiError } from "../middleware/error.middleware";

/**
 * Controller for recommendation operations
 */
export class RecommendationController {
  /**
   * Get active recommendations for a business
   */
  async getActiveRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { businessId } = req.params;

      // Validate business ID
      if (!businessId) {
        throw new ApiError(400, "Business ID is required");
      }

      // Get recommendations
      const recommendations =
        await recommendationService.getActiveRecommendationsForBusiness(
          businessId
        );

      res.status(200).json({
        success: true,
        count: recommendations.length,
        data: recommendations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a recommendation by ID
   */
  async getRecommendationById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { recommendationId } = req.params;

      // Validate recommendation ID
      if (!recommendationId) {
        throw new ApiError(400, "Recommendation ID is required");
      }

      // Get recommendation
      const recommendation = await recommendationService.getRecommendationById(
        recommendationId
      );

      if (!recommendation) {
        throw new ApiError(
          404,
          `Recommendation not found with ID: ${recommendationId}`
        );
      }

      res.status(200).json({
        success: true,
        data: recommendation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update recommendation status
   */
  async updateRecommendationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { recommendationId } = req.params;
      const { status, reason } = req.body;

      // Validate required fields
      if (!recommendationId) {
        throw new ApiError(400, "Recommendation ID is required");
      }

      if (
        !status ||
        !Object.values(RecommendationStatus).includes(
          status as RecommendationStatus
        )
      ) {
        throw new ApiError(400, "Valid status is required");
      }

      // Update status
      const recommendation =
        await recommendationService.updateRecommendationStatus(
          recommendationId,
          status as RecommendationStatus,
          reason
        );

      if (!recommendation) {
        throw new ApiError(
          404,
          `Recommendation not found with ID: ${recommendationId}`
        );
      }

      res.status(200).json({
        success: true,
        message: `Recommendation status updated to ${status}`,
        data: recommendation,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate inventory recommendations
   */
  async generateInventoryRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { businessId } = req.params;

      // Validate business ID
      if (!businessId) {
        throw new ApiError(400, "Business ID is required");
      }

      // Generate recommendations
      const recommendations =
        await recommendationService.generateInventoryRecommendations(
          businessId
        );

      res.status(201).json({
        success: true,
        message: "Inventory recommendations generated successfully",
        count: recommendations.length,
        data: recommendations,
      });
    } catch (error) {
      logger.error("Error generating inventory recommendations", { error });
      next(error);
    }
  }

  /**
   * Generate pricing recommendations
   */
  async generatePricingRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { businessId } = req.params;

      // Validate business ID
      if (!businessId) {
        throw new ApiError(400, "Business ID is required");
      }

      // Generate recommendations
      const recommendations =
        await recommendationService.generatePricingRecommendations(businessId);

      res.status(201).json({
        success: true,
        message: "Pricing recommendations generated successfully",
        count: recommendations.length,
        data: recommendations,
      });
    } catch (error) {
      logger.error("Error generating pricing recommendations", { error });
      next(error);
    }
  }

  /**
   * Generate expiry management recommendations
   */
  async generateExpiryRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { businessId } = req.params;

      // Validate business ID
      if (!businessId) {
        throw new ApiError(400, "Business ID is required");
      }

      // Generate recommendations
      const recommendations =
        await recommendationService.generateExpiryRecommendations(businessId);

      res.status(201).json({
        success: true,
        message: "Expiry management recommendations generated successfully",
        count: recommendations.length,
        data: recommendations,
      });
    } catch (error) {
      logger.error("Error generating expiry recommendations", { error });
      next(error);
    }
  }
}

// Export singleton instance
export const recommendationController = new RecommendationController();
