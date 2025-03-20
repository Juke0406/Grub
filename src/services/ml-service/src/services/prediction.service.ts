import {
  Prediction,
  IPrediction,
  PredictionStatus,
} from "../models/prediction.model";
import { ModelType } from "../models/ml-model.model";
import { modelService } from "./model.service";
import { logger } from "../utils/logger";
import { cachePrediction, getCachedPrediction } from "../redis";
import { produceMessage } from "../kafka";
import { config } from "../config";

// Custom error class
export class PredictionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PredictionError";
  }
}

/**
 * Service for managing predictions
 */
export class PredictionService {
  /**
   * Create a new prediction request
   */
  async createPrediction(
    businessId: string,
    modelType: ModelType,
    inputData: Record<string, any>,
    targetId?: string,
    targetType?: "product" | "bundle" | "business"
  ): Promise<IPrediction> {
    try {
      // Get the active model for this business and model type
      const model = await modelService.getActiveModelForBusiness(
        businessId,
        modelType
      );

      if (!model) {
        throw new Error(
          `No active model found for business ${businessId} and model type ${modelType}`
        );
      }

      // Create prediction record
      const prediction = new Prediction({
        businessId,
        modelId: model._id,
        modelType,
        targetId,
        targetType,
        inputData,
        status: PredictionStatus.PENDING,
      });

      await prediction.save();

      // Process prediction asynchronously
      this.processPrediction(prediction._id.toString()).catch((error) => {
        logger.error("Error processing prediction", {
          error,
          predictionId: prediction._id,
        });
      });

      return prediction;
    } catch (error) {
      logger.error("Error creating prediction", {
        error,
        businessId,
        modelType,
      });
      throw error;
    }
  }

  /**
   * Get prediction by ID
   */
  async getPredictionById(predictionId: string): Promise<IPrediction | null> {
    try {
      // Try to get from cache first
      const cachedPrediction = await getCachedPrediction(predictionId);
      if (cachedPrediction) {
        return cachedPrediction as unknown as IPrediction;
      }

      // If not in cache, get from database
      const prediction = await Prediction.findById(predictionId);

      // Cache the prediction if found
      if (prediction) {
        await cachePrediction(predictionId, prediction.toObject());
      }

      return prediction;
    } catch (error) {
      logger.error("Error getting prediction by ID", {
        error,
        predictionId,
      });
      throw error;
    }
  }

  /**
   * Process a prediction
   */
  async processPrediction(predictionId: string): Promise<void> {
    try {
      const prediction = await Prediction.findById(predictionId);

      if (!prediction) {
        throw new Error(`Prediction not found: ${predictionId}`);
      }

      // Skip if already processed
      if (prediction.status !== PredictionStatus.PENDING) {
        return;
      }

      // Get the model
      const model = await modelService.getModelById(
        prediction.modelId.toString()
      );

      if (!model) {
        throw new Error(`Model not found: ${prediction.modelId}`);
      }

      // Deserialize the model
      const modelData = JSON.parse(model.serializedModel);
      let result: Record<string, any> = {};
      let confidence = 0;

      // Generate prediction based on model type
      switch (model.modelType) {
        case ModelType.DEMAND_PREDICTION:
          result = this.generateDemandPrediction(
            modelData,
            prediction.inputData,
            model.features
          );
          confidence = this.calculateConfidence(result, model.metrics);
          break;

        case ModelType.INVENTORY_FORECAST:
          result = this.generateInventoryForecast(
            modelData,
            prediction.inputData,
            model.features
          );
          confidence = this.calculateConfidence(result, model.metrics);
          break;

        case ModelType.PRICE_OPTIMIZATION:
          result = this.generatePriceOptimization(
            modelData,
            prediction.inputData,
            model.features
          );
          confidence = this.calculateConfidence(result, model.metrics);
          break;

        case ModelType.EXPIRY_PREDICTION:
          result = this.generateExpiryPrediction(
            modelData,
            prediction.inputData,
            model.features
          );
          confidence = this.calculateConfidence(result, model.metrics);
          break;

        default:
          throw new Error(`Unsupported model type: ${model.modelType}`);
      }

      // Update prediction with results
      prediction.predictionResult = result;
      prediction.confidence = confidence;
      prediction.status = PredictionStatus.COMPLETED;
      await prediction.save();

      // Cache the updated prediction
      await cachePrediction(predictionId, prediction.toObject());

      // Publish prediction created event
      await produceMessage(config.predictionCreatedTopic, {
        predictionId: prediction._id,
        businessId: prediction.businessId,
        modelType: prediction.modelType,
        targetId: prediction.targetId,
        targetType: prediction.targetType,
        result,
        confidence,
      });

      logger.info(`Prediction completed: ${predictionId}`, {
        predictionId,
        confidence,
      });
    } catch (error) {
      logger.error("Error processing prediction", {
        error,
        predictionId,
      });

      // Update prediction with error
      try {
        const prediction = await Prediction.findById(predictionId);
        if (prediction) {
          prediction.status = PredictionStatus.FAILED;
          prediction.errorMessage = (error as Error).message;
          await prediction.save();
        }
      } catch (updateError) {
        logger.error("Error updating prediction with failure status", {
          error: updateError,
          predictionId,
        });
      }

      throw new PredictionError(
        `Failed to process prediction: ${(error as Error).message}`
      );
    }
  }

  /**
   * Generate demand prediction
   */
  private generateDemandPrediction(
    modelData: any,
    inputData: Record<string, any>,
    features: string[]
  ): Record<string, any> {
    // Prepare input features in the correct order
    const inputFeatures = features.map((feature) => inputData[feature] || 0);

    // Use the appropriate ML library based on the model type
    // This is a simplified example - in a real implementation, you would
    // use the appropriate library and method based on the algorithm
    const predictedDemand = this.predictWithModel(modelData, inputFeatures);

    return {
      predictedDemand: Math.max(0, Math.round(predictedDemand)),
      forecastPeriod: inputData.forecastPeriod || "daily",
      factors: this.extractKeyFactors(features, inputFeatures, modelData),
    };
  }

  /**
   * Generate inventory forecast
   */
  private generateInventoryForecast(
    modelData: any,
    inputData: Record<string, any>,
    features: string[]
  ): Record<string, any> {
    // Prepare input features in the correct order
    const inputFeatures = features.map((feature) => inputData[feature] || 0);

    // Use the appropriate ML library based on the model type
    const predictedInventory = this.predictWithModel(modelData, inputFeatures);

    return {
      predictedInventory: Math.max(0, Math.round(predictedInventory)),
      forecastPeriod: inputData.forecastPeriod || "weekly",
      reorderPoint: Math.max(0, Math.round(predictedInventory * 0.2)), // Example: 20% of predicted inventory
      safetyStock: Math.max(0, Math.round(predictedInventory * 0.1)), // Example: 10% of predicted inventory
      factors: this.extractKeyFactors(features, inputFeatures, modelData),
    };
  }

  /**
   * Generate price optimization
   */
  private generatePriceOptimization(
    modelData: any,
    inputData: Record<string, any>,
    features: string[]
  ): Record<string, any> {
    // Prepare input features in the correct order
    const inputFeatures = features.map((feature) => inputData[feature] || 0);

    // Use the appropriate ML library based on the model type
    const predictedPrice = this.predictWithModel(modelData, inputFeatures);

    // Calculate optimal discount
    const originalPrice = inputData.originalPrice || 0;
    const optimalPrice = Math.max(0, predictedPrice);
    const optimalDiscount =
      originalPrice > 0
        ? Math.min(
            100,
            Math.max(0, ((originalPrice - optimalPrice) / originalPrice) * 100)
          )
        : 0;

    return {
      optimalPrice: parseFloat(optimalPrice.toFixed(2)),
      optimalDiscount: parseFloat(optimalDiscount.toFixed(2)),
      estimatedDemandIncrease: parseFloat((optimalDiscount * 0.5).toFixed(2)), // Example: 0.5% increase for each 1% discount
      factors: this.extractKeyFactors(features, inputFeatures, modelData),
    };
  }

  /**
   * Generate expiry prediction
   */
  private generateExpiryPrediction(
    modelData: any,
    inputData: Record<string, any>,
    features: string[]
  ): Record<string, any> {
    // Prepare input features in the correct order
    const inputFeatures = features.map((feature) => inputData[feature] || 0);

    // Use the appropriate ML library based on the model type
    const expiryRisk = this.predictWithModel(modelData, inputFeatures);

    // Calculate days until expiry
    const daysUntilExpiry = inputData.daysUntilExpiry || 7;

    // Calculate recommended discount based on expiry risk and days until expiry
    const recommendedDiscount = Math.min(
      90,
      Math.max(10, expiryRisk * 100 + (7 - daysUntilExpiry) * 5)
    );

    return {
      expiryRisk: parseFloat(expiryRisk.toFixed(2)),
      daysUntilExpiry,
      recommendedDiscount: parseFloat(recommendedDiscount.toFixed(2)),
      factors: this.extractKeyFactors(features, inputFeatures, modelData),
    };
  }

  /**
   * Predict with model
   */
  private predictWithModel(modelData: any, inputFeatures: number[]): number {
    // This is a simplified implementation
    // In a real application, you would use the appropriate ML library
    // based on the algorithm type and model data

    // Example: Linear regression prediction
    if (modelData.weights && modelData.intercept) {
      // Simple linear regression
      let prediction = modelData.intercept;
      for (let i = 0; i < inputFeatures.length; i++) {
        prediction += inputFeatures[i] * (modelData.weights[i] || 0);
      }
      return prediction;
    }

    // Example: Random forest prediction
    if (modelData.trees) {
      // Simplified random forest prediction
      // In a real implementation, you would use the ml-random-forest library
      return 50; // Placeholder value
    }

    // Default fallback
    return 0;
  }

  /**
   * Extract key factors that influenced the prediction
   */
  private extractKeyFactors(
    features: string[],
    inputFeatures: number[],
    modelData: any
  ): { feature: string; importance: number }[] {
    // This is a simplified implementation
    // In a real application, you would extract feature importance
    // based on the model type and algorithm

    // Example: For linear regression, use coefficient magnitudes
    if (modelData.weights) {
      const factors = features.map((feature, index) => ({
        feature,
        importance: Math.abs(modelData.weights[index] || 0),
      }));

      // Sort by importance and take top 3
      return factors
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 3)
        .map((factor) => ({
          feature: factor.feature,
          importance: parseFloat(factor.importance.toFixed(2)),
        }));
    }

    // Default fallback
    return features.slice(0, 3).map((feature, index) => ({
      feature,
      importance: parseFloat((1 - index * 0.2).toFixed(2)),
    }));
  }

  /**
   * Calculate confidence score based on model metrics
   */
  private calculateConfidence(
    result: Record<string, any>,
    metrics: Record<string, number>
  ): number {
    // This is a simplified implementation
    // In a real application, you would calculate confidence
    // based on model metrics and prediction characteristics

    // Example: For regression models, use R-squared
    if (metrics.r2 !== undefined) {
      return Math.max(0, Math.min(1, metrics.r2));
    }

    // Example: For classification models, use accuracy
    if (metrics.accuracy !== undefined) {
      return Math.max(0, Math.min(1, metrics.accuracy));
    }

    // Default fallback
    return 0.7; // Moderate confidence
  }
}

// Export singleton instance
export const predictionService = new PredictionService();
