import { Request, Response, NextFunction } from "express";
import { modelService } from "../services/model.service";
import { dataService } from "../services/data.service";
import { ModelType, AlgorithmType } from "../models/ml-model.model";
import { logger } from "../utils/logger";
import { ApiError } from "../middleware/error.middleware";

/**
 * Controller for ML model operations
 */
export class ModelController {
  /**
   * Get all models for a business
   */
  async getModels(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { businessId } = req.params;
      const { modelType, isActive } = req.query;

      // Validate business ID
      if (!businessId) {
        throw new ApiError(400, "Business ID is required");
      }

      // Build query
      const query: any = { businessId };

      if (modelType) {
        query.modelType = modelType;
      }

      if (isActive !== undefined) {
        query.isActive = isActive === "true";
      }

      // Get models from database
      const models = await modelService.getModelsForBusiness(businessId, query);

      res.status(200).json({
        success: true,
        count: models.length,
        data: models,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific model by ID
   */
  async getModelById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { modelId } = req.params;

      // Validate model ID
      if (!modelId) {
        throw new ApiError(400, "Model ID is required");
      }

      // Get model from database
      const model = await modelService.getModelById(modelId);

      if (!model) {
        throw new ApiError(404, `Model not found with ID: ${modelId}`);
      }

      res.status(200).json({
        success: true,
        data: model,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Train a new model
   */
  async trainModel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { businessId } = req.params;
      const { modelType, algorithm, parameters } = req.body;

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

      if (
        !algorithm ||
        !Object.values(AlgorithmType).includes(algorithm as AlgorithmType)
      ) {
        throw new ApiError(400, "Valid algorithm type is required");
      }

      // Collect training data
      const trainingData = await dataService.collectTrainingData(
        businessId,
        modelType as ModelType
      );

      // Train the model
      const model = await modelService.trainModel(
        businessId,
        modelType as ModelType,
        algorithm as AlgorithmType,
        trainingData,
        parameters || {}
      );

      res.status(201).json({
        success: true,
        message: "Model trained successfully",
        data: model,
      });
    } catch (error) {
      logger.error("Error training model", { error });
      next(error);
    }
  }

  /**
   * Update model status (activate/deactivate)
   */
  async updateModelStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { modelId } = req.params;
      const { isActive } = req.body;

      // Validate required fields
      if (!modelId) {
        throw new ApiError(400, "Model ID is required");
      }

      if (isActive === undefined) {
        throw new ApiError(400, "isActive status is required");
      }

      // Update model status
      const model = await modelService.updateModelStatus(modelId, isActive);

      if (!model) {
        throw new ApiError(404, `Model not found with ID: ${modelId}`);
      }

      res.status(200).json({
        success: true,
        message: `Model ${isActive ? "activated" : "deactivated"} successfully`,
        data: model,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a model
   */
  async deleteModel(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { modelId } = req.params;

      // Validate model ID
      if (!modelId) {
        throw new ApiError(400, "Model ID is required");
      }

      // Delete model
      const result = await modelService.deleteModel(modelId);

      if (!result) {
        throw new ApiError(404, `Model not found with ID: ${modelId}`);
      }

      res.status(200).json({
        success: true,
        message: "Model deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export const modelController = new ModelController();
