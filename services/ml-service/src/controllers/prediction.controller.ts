import { Request, Response, NextFunction } from "express";
import { predictionService } from "../services/prediction.service";
import { ModelType } from "../models/ml-model.model";
import { PredictionStatus } from "../models/prediction.model";
import { logger } from "../utils/logger";
import { ApiError } from "../middleware/error.middleware";

/**
 * Controller for prediction operations
 */
export class PredictionController {
  /**
   * Create a new prediction
   */
  async createPrediction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { businessId } = req.params;
      const { modelType, inputData, targetId, targetType } = req.body;

      // Validate required fields
      if (!businessId) {
        throw new ApiError(400, "Business ID is required");
      }

      if (
        !modelType ||
        !Object.values(ModelType).includes(modelType as ModelType)
      ) {
        throw new ApiError(400, "Valid model type is required");
      }

      if (!inputData || typeof inputData !== "object") {
        throw new ApiError(400, "Valid input data is required");
      }

      // Create prediction
      const prediction = await predictionService.createPrediction(
        businessId,
        modelType as ModelType,
        inputData,
        targetId,
        targetType as "product" | "bundle" | "business"
      );

      res.status(201).json({
        success: true,
        message: "Prediction created successfully",
        data: prediction,
      });
    } catch (error) {
      logger.error("Error creating prediction", { error });
      next(error);
    }
  }

  /**
   * Get a prediction by ID
   */
  async getPredictionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { predictionId } = req.params;

      // Validate prediction ID
      if (!predictionId) {
        throw new ApiError(400, "Prediction ID is required");
      }

      // Get prediction
      const prediction = await predictionService.getPredictionById(
        predictionId
      );

      if (!prediction) {
        throw new ApiError(
          404,
          `Prediction not found with ID: ${predictionId}`
        );
      }

      res.status(200).json({
        success: true,
        data: prediction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get predictions for a business
   */
  async getPredictionsForBusiness(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { businessId } = req.params;
      const { modelType, status, targetId, targetType, limit, page } =
        req.query;

      // Validate business ID
      if (!businessId) {
        throw new ApiError(400, "Business ID is required");
      }

      // Build query
      const query: any = { businessId };

      if (modelType) {
        query.modelType = modelType;
      }

      if (status) {
        query.status = status;
      }

      if (targetId) {
        query.targetId = targetId;
      }

      if (targetType) {
        query.targetType = targetType;
      }

      // Pagination
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;

      // Get predictions
      const predictions = await predictionService.getPredictionsForBusiness(
        businessId,
        query,
        pageNum,
        limitNum
      );

      res.status(200).json({
        success: true,
        count: predictions.length,
        data: predictions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate demand prediction
   */
  async generateDemandPrediction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { businessId } = req.params;
      const { productId, inputData } = req.body;

      // Validate required fields
      if (!businessId) {
        throw new ApiError(400, "Business ID is required");
      }

      if (!productId) {
        throw new ApiError(400, "Product ID is required");
      }

      if (!inputData || typeof inputData !== "object") {
        throw new ApiError(400, "Valid input data is required");
      }

      // Create prediction
      const prediction = await predictionService.createPrediction(
        businessId,
        ModelType.DEMAND_PREDICTION,
        {
          ...inputData,
          productId,
        },
        productId,
        "product"
      );

      res.status(201).json({
        success: true,
        message: "Demand prediction created successfully",
        data: prediction,
      });
    } catch (error) {
      logger.error("Error generating demand prediction", { error });
      next(error);
    }
  }

  /**
   * Generate inventory forecast
   */
  async generateInventoryForecast(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { businessId } = req.params;
      const { inputData } = req.body;

      // Validate required fields
      if (!businessId) {
        throw new ApiError(400, "Business ID is required");
      }

      if (!inputData || typeof inputData !== "object") {
        throw new ApiError(400, "Valid input data is required");
      }

      // Create prediction
      const prediction = await predictionService.createPrediction(
        businessId,
        ModelType.INVENTORY_FORECAST,
        inputData,
        businessId,
        "business"
      );

      res.status(201).json({
        success: true,
        message: "Inventory forecast created successfully",
        data: prediction,
      });
    } catch (error) {
      logger.error("Error generating inventory forecast", { error });
      next(error);
    }
  }

  /**
   * Generate price optimization
   */
  async generatePriceOptimization(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { businessId } = req.params;
      const { productId, inputData } = req.body;

      // Validate required fields
      if (!businessId) {
        throw new ApiError(400, "Business ID is required");
      }

      if (!productId) {
        throw new ApiError(400, "Product ID is required");
      }

      if (!inputData || typeof inputData !== "object") {
        throw new ApiError(400, "Valid input data is required");
      }

      // Create prediction
      const prediction = await predictionService.createPrediction(
        businessId,
        ModelType.PRICE_OPTIMIZATION,
        {
          ...inputData,
          productId,
        },
        productId,
        "product"
      );

      res.status(201).json({
        success: true,
        message: "Price optimization created successfully",
        data: prediction,
      });
    } catch (error) {
      logger.error("Error generating price optimization", { error });
      next(error);
    }
  }
}

// Export singleton instance
export const predictionController = new PredictionController();
