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
  err: Error,
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
      errors: err.errors,
    });
  }

  // Handle validation errors (from express-validator)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err,
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate key error",
      errors: err,
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

  // Default to 500 server error
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
