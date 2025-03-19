import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Error handling middleware
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error("Error occurred:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || undefined,
    });
  }

  // Handle validation errors (from express-validator)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: (err as any).errors,
    });
  }

  // Handle MongoDB duplicate key errors
  if ((err as any).code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate resource",
      error: "A resource with the same unique identifier already exists",
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Handle ML-specific errors
  if (err.name === "ModelTrainingError") {
    return res.status(500).json({
      success: false,
      message: "Error training ML model",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }

  if (err.name === "PredictionError") {
    return res.status(500).json({
      success: false,
      message: "Error generating prediction",
      error: process.env.NODE_ENV === "production" ? undefined : err.message,
    });
  }

  if (err.name === "InsufficientDataError") {
    return res.status(400).json({
      success: false,
      message: "Insufficient data for ML operation",
      error: "Not enough data points available for reliable prediction",
    });
  }

  // Default to 500 server error
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
};

// Not found middleware
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Resource not found",
  });
};

// Export middleware as a single object
export const errorMiddleware = {
  errorHandler,
  notFoundHandler,
};
