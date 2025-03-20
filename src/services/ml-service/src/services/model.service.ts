import {
  MLModel,
  ModelType,
  AlgorithmType,
  IMLModel,
} from "../models/ml-model.model";
import { logger } from "../utils/logger";
import { cacheModel, getCachedModel } from "../redis";
import * as mlRegression from "ml-regression";
import {
  RandomForestClassifier,
  RandomForestRegression,
} from "ml-random-forest";
import { Matrix } from "ml-matrix";
import { ApiError } from "../middleware/error.middleware";

// Custom error classes
export class ModelTrainingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelTrainingError";
  }
}

export class InsufficientDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientDataError";
  }
}

/**
 * Service for managing ML models
 */
export class ModelService {
  /**
   * Create a new ML model
   */
  async createModel(modelData: Partial<IMLModel>): Promise<IMLModel> {
    try {
      const model = new MLModel(modelData);
      await model.save();
      logger.info(`Created new ML model: ${model.name}`, {
        modelId: model._id,
      });
      return model;
    } catch (error) {
      logger.error("Error creating ML model", { error, modelData });
      throw error;
    }
  }

  /**
   * Get ML model by ID
   */
  async getModelById(modelId: string): Promise<IMLModel | null> {
    try {
      // Try to get from cache first
      const cachedModel = await getCachedModel(modelId);
      if (cachedModel) {
        return cachedModel as unknown as IMLModel;
      }

      // If not in cache, get from database
      const model = await MLModel.findById(modelId);

      // Cache the model if found
      if (model) {
        await cacheModel(modelId, model.toObject());
      }

      return model;
    } catch (error) {
      logger.error("Error getting ML model by ID", { error, modelId });
      throw error;
    }
  }

  /**
   * Get active ML model for a business and model type
   */
  async getActiveModelForBusiness(
    businessId: string,
    modelType: ModelType
  ): Promise<IMLModel | null> {
    try {
      const model = await MLModel.findOne({
        businessId,
        modelType,
        isActive: true,
      }).sort({ version: -1 });

      return model;
    } catch (error) {
      logger.error("Error getting active ML model for business", {
        error,
        businessId,
        modelType,
      });
      throw error;
    }
  }

  /**
   * Train a new ML model
   */
  async trainModel(
    businessId: string,
    modelType: ModelType,
    algorithm: AlgorithmType,
    trainingData: {
      features: number[][];
      labels: number[];
      featureNames: string[];
      targetName: string;
    },
    parameters: Record<string, any> = {}
  ): Promise<IMLModel> {
    try {
      // Check if we have enough data points
      if (trainingData.features.length < 10) {
        throw new InsufficientDataError(
          "Not enough data points for training. Minimum required: 10"
        );
      }

      // Convert training data to appropriate format
      const X = new Matrix(trainingData.features);
      const y = trainingData.labels;

      // Train model based on algorithm type
      let trainedModel: any;
      let metrics: Record<string, number> = {};

      switch (algorithm) {
        case AlgorithmType.LINEAR_REGRESSION:
          trainedModel = new mlRegression.MultivariateLinearRegression(
            trainingData.features,
            trainingData.labels,
            parameters
          );
          metrics = this.evaluateRegressionModel(trainedModel, X, y);
          break;

        case AlgorithmType.RANDOM_FOREST:
          if (
            modelType === ModelType.DEMAND_PREDICTION ||
            modelType === ModelType.INVENTORY_FORECAST ||
            modelType === ModelType.PRICE_OPTIMIZATION
          ) {
            // Regression task
            trainedModel = new RandomForestRegression({
              seed: 42,
              nEstimators: parameters.nEstimators || 100,
              maxFeatures: parameters.maxFeatures || 0.8,
              replacement: parameters.replacement || true,
              ...parameters,
            });
            trainedModel.train(trainingData.features, trainingData.labels);
            metrics = this.evaluateRegressionModel(trainedModel, X, y);
          } else {
            // Classification task
            trainedModel = new RandomForestClassifier({
              seed: 42,
              nEstimators: parameters.nEstimators || 100,
              maxFeatures: parameters.maxFeatures || 0.8,
              replacement: parameters.replacement || true,
              ...parameters,
            });
            trainedModel.train(trainingData.features, trainingData.labels);
            metrics = this.evaluateClassificationModel(trainedModel, X, y);
          }
          break;

        // Add more algorithm implementations as needed

        default:
          throw new Error(`Unsupported algorithm type: ${algorithm}`);
      }

      // Serialize the model
      const serializedModel = JSON.stringify(trainedModel.toJSON());

      // Create a new model record
      const existingModel = await this.getActiveModelForBusiness(
        businessId,
        modelType
      );

      const newModel = await this.createModel({
        name: `${modelType}_${algorithm}_v${
          existingModel ? existingModel.version + 1 : 1
        }`,
        description: `${modelType} model using ${algorithm} algorithm`,
        businessId: businessId as any,
        modelType,
        algorithm,
        parameters,
        features: trainingData.featureNames,
        target: trainingData.targetName,
        metrics,
        serializedModel,
        version: existingModel ? existingModel.version + 1 : 1,
        isActive: true,
        trainingDataPoints: trainingData.features.length,
        lastTrainedAt: new Date(),
      });

      // If there was an existing model, deactivate it
      if (existingModel) {
        existingModel.isActive = false;
        await existingModel.save();
      }

      logger.info(`Trained new ML model: ${newModel.name}`, {
        modelId: newModel._id,
        metrics,
      });

      return newModel;
    } catch (error) {
      if (error instanceof InsufficientDataError) {
        throw error;
      }

      logger.error("Error training ML model", {
        error,
        businessId,
        modelType,
        algorithm,
      });

      throw new ModelTrainingError(
        `Failed to train model: ${(error as Error).message}`
      );
    }
  }

  /**
   * Evaluate regression model performance
   */
  private evaluateRegressionModel(
    model: any,
    X: Matrix,
    y: number[]
  ): Record<string, number> {
    const predictions = X.toJSON().map((row: number[]) => model.predict(row));

    // Calculate metrics
    const mse = this.calculateMSE(y, predictions);
    const rmse = Math.sqrt(mse);
    const mae = this.calculateMAE(y, predictions);
    const r2 = this.calculateR2(y, predictions);

    return { mse, rmse, mae, r2 };
  }

  /**
   * Evaluate classification model performance
   */
  private evaluateClassificationModel(
    model: any,
    X: Matrix,
    y: number[]
  ): Record<string, number> {
    const predictions = X.toJSON().map((row: number[]) => model.predict(row));

    // Calculate metrics
    const { accuracy, precision, recall, f1Score } =
      this.calculateClassificationMetrics(y, predictions);

    return { accuracy, precision, recall, f1Score };
  }

  /**
   * Calculate Mean Squared Error
   */
  private calculateMSE(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length) {
      throw new Error("Arrays must have the same length");
    }

    const sumSquaredErrors = actual.reduce(
      (sum, value, index) => sum + Math.pow(value - predicted[index], 2),
      0
    );

    return sumSquaredErrors / actual.length;
  }

  /**
   * Calculate Mean Absolute Error
   */
  private calculateMAE(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length) {
      throw new Error("Arrays must have the same length");
    }

    const sumAbsoluteErrors = actual.reduce(
      (sum, value, index) => sum + Math.abs(value - predicted[index]),
      0
    );

    return sumAbsoluteErrors / actual.length;
  }

  /**
   * Calculate R-squared (coefficient of determination)
   */
  private calculateR2(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length) {
      throw new Error("Arrays must have the same length");
    }

    const mean = actual.reduce((sum, value) => sum + value, 0) / actual.length;

    const totalSumSquares = actual.reduce(
      (sum, value) => sum + Math.pow(value - mean, 2),
      0
    );

    const residualSumSquares = actual.reduce(
      (sum, value, index) => sum + Math.pow(value - predicted[index], 2),
      0
    );

    return 1 - residualSumSquares / totalSumSquares;
  }

  /**
   * Calculate classification metrics
   */
  private calculateClassificationMetrics(
    actual: number[],
    predicted: number[]
  ): {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  } {
    if (actual.length !== predicted.length) {
      throw new Error("Arrays must have the same length");
    }

    // For binary classification
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < actual.length; i++) {
      if (actual[i] === 1 && predicted[i] === 1) {
        truePositives++;
      } else if (actual[i] === 0 && predicted[i] === 1) {
        falsePositives++;
      } else if (actual[i] === 0 && predicted[i] === 0) {
        trueNegatives++;
      } else if (actual[i] === 1 && predicted[i] === 0) {
        falseNegatives++;
      }
    }

    const accuracy = (truePositives + trueNegatives) / actual.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = (2 * (precision * recall)) / (precision + recall) || 0;

    return { accuracy, precision, recall, f1Score };
  }
}

// Export singleton instance
export const modelService = new ModelService();
