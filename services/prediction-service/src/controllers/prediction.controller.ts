import { Request, Response, NextFunction } from "express";
import {
  Prediction,
  PredictionStatus,
  PredictionType,
} from "../models/prediction.model";
import { ProductDemand } from "../models/product-demand.model";
import { ApiError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { publishPredictionGenerated } from "../kafka";
import axios from "axios";
import { config } from "../config";

/**
 * Generate a prediction for a business
 */
export const generatePrediction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId, type, startDate, endDate } = req.body;

    // Create a new prediction record
    const prediction = new Prediction({
      businessId,
      type,
      status: PredictionStatus.PENDING,
      startDate,
      endDate,
      items: [],
    });

    // Save the prediction to the database
    await prediction.save();
    logger.info(`Created new prediction request`, {
      predictionId: prediction._id,
    });

    // Start the prediction process asynchronously
    processPrediction(prediction._id.toString())
      .then(() => {
        logger.info(`Prediction processing completed`, {
          predictionId: prediction._id,
        });
      })
      .catch((error) => {
        logger.error(`Prediction processing failed`, {
          predictionId: prediction._id,
          error: error.message,
        });
      });

    // Return the prediction ID to the client
    return res.status(202).json({
      success: true,
      message: "Prediction generation started",
      data: {
        predictionId: prediction._id,
        status: prediction.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process a prediction asynchronously
 */
const processPrediction = async (predictionId: string) => {
  try {
    // Get the prediction from the database
    const prediction = await Prediction.findById(predictionId);
    if (!prediction) {
      throw new Error(`Prediction not found: ${predictionId}`);
    }

    // Update status to processing
    prediction.status = PredictionStatus.PENDING;
    await prediction.save();

    // Get historical data for the business
    const historicalData = await ProductDemand.find({
      businessId: prediction.businessId,
      date: { $lt: new Date() },
    })
      .sort({ date: -1 })
      .limit(90); // Get last 90 days of data

    if (historicalData.length === 0) {
      throw new Error("Insufficient historical data for prediction");
    }

    // Prepare data for ML service
    const mlRequestData = {
      businessId: prediction.businessId,
      predictionType: prediction.type,
      startDate: prediction.startDate,
      endDate: prediction.endDate,
      historicalData: historicalData.map((item) => ({
        productId: item.productId,
        date: item.date,
        quantity: item.quantity,
        reservationCount: item.reservationCount,
        salesCount: item.salesCount,
        wastageCount: item.wastageCount,
      })),
    };

    // Call ML service for prediction
    const mlResponse = await axios.post(
      `${config.mlServiceUrl}/predict`,
      mlRequestData
    );

    // Process ML service response
    const predictionResults = mlResponse.data.predictions;

    // Update prediction with results
    prediction.items = predictionResults.map((result: any) => ({
      productId: result.productId,
      productName: result.productName,
      predictedDemand: result.predictedDemand,
      confidence: result.confidence,
      recommendedStock: result.recommendedStock,
    }));

    prediction.status = PredictionStatus.COMPLETED;
    prediction.metadata = {
      mlServiceVersion: mlResponse.data.version,
      modelType: mlResponse.data.modelType,
      processedAt: new Date(),
    };

    await prediction.save();

    // Publish prediction generated event
    await publishPredictionGenerated({
      predictionId: prediction._id,
      businessId: prediction.businessId,
      type: prediction.type,
      startDate: prediction.startDate,
      endDate: prediction.endDate,
      itemCount: prediction.items.length,
    });

    return prediction;
  } catch (error) {
    // Update prediction status to failed
    const prediction = await Prediction.findById(predictionId);
    if (prediction) {
      prediction.status = PredictionStatus.FAILED;
      prediction.metadata = {
        ...prediction.metadata,
        error: (error as Error).message,
        failedAt: new Date(),
      };
      await prediction.save();
    }

    logger.error(`Prediction processing failed`, {
      predictionId,
      error: (error as Error).message,
    });

    throw error;
  }
};

/**
 * Get a prediction by ID
 */
export const getPrediction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const prediction = await Prediction.findById(id);
    if (!prediction) {
      throw new ApiError(404, "Prediction not found");
    }

    // Check if user has access to this prediction
    if (
      req.user.role !== "admin" &&
      prediction.businessId !== req.user.businessId
    ) {
      throw new ApiError(403, "You don't have access to this prediction");
    }

    return res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List predictions for a business
 */
export const listPredictions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId, type, startDate, endDate } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { businessId };

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) {
        query.startDate.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.endDate = { $lte: new Date(endDate as string) };
      }
    }

    // Check if user has access to this business's predictions
    if (req.user.role !== "admin" && req.user.businessId !== businessId) {
      throw new ApiError(
        403,
        "You don't have access to this business's predictions"
      );
    }

    // Get predictions
    const predictions = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Prediction.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        predictions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger a scheduled prediction generation
 */
export const triggerScheduledPrediction = async (
  type: PredictionType,
  businessIds: string[]
) => {
  try {
    logger.info(
      `Triggering scheduled ${type} predictions for ${businessIds.length} businesses`
    );

    // Calculate start and end dates based on prediction type
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (type) {
      case PredictionType.DAILY:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() + 1); // Tomorrow

        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1); // Day after tomorrow
        break;

      case PredictionType.WEEKLY:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - startDate.getDay() + 7); // Next Sunday

        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7); // Sunday after next
        break;

      case PredictionType.MONTHLY:
        startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // First day of next month
        endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0); // Last day of next month
        break;

      default:
        throw new Error(`Unsupported prediction type: ${type}`);
    }

    // Generate predictions for each business
    for (const businessId of businessIds) {
      try {
        // Create a new prediction
        const prediction = new Prediction({
          businessId,
          type,
          status: PredictionStatus.PENDING,
          startDate,
          endDate,
          items: [],
        });

        // Save the prediction
        await prediction.save();
        logger.info(`Created scheduled ${type} prediction`, {
          businessId,
          predictionId: prediction._id,
        });

        // Process the prediction asynchronously
        processPrediction(prediction._id.toString())
          .then(() => {
            logger.info(`Scheduled prediction processing completed`, {
              businessId,
              predictionId: prediction._id,
            });
          })
          .catch((error) => {
            logger.error(`Scheduled prediction processing failed`, {
              businessId,
              predictionId: prediction._id,
              error: error.message,
            });
          });
      } catch (error) {
        logger.error(`Failed to create scheduled prediction for business`, {
          businessId,
          error: (error as Error).message,
        });
      }
    }

    logger.info(`Scheduled ${type} predictions triggered successfully`);
  } catch (error) {
    logger.error(`Failed to trigger scheduled predictions`, {
      type,
      error: (error as Error).message,
    });
    throw error;
  }
};
