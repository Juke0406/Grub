import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

// Custom API error class
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = "Internal Server Error";
  let isOperational = false;

  // If it's our ApiError, use its values
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 400;
    message = err.message;
    isOperational = true;
  } else if (err.name === "CastError") {
    // Mongoose cast error (e.g., invalid ObjectId)
    statusCode = 400;
    message = "Invalid ID format";
    isOperational = true;
  } else if (err.name === "MongoServerError" && (err as any).code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    message = "Duplicate key error";
    isOperational = true;
  }

  // Log error
  if (isOperational) {
    logger.warn(`Operational error: ${message}`, {
      statusCode,
      path: req.path,
      method: req.method,
      error: err.message,
    });
  } else {
    logger.error(`Unhandled error: ${err.message}`, {
      statusCode,
      path: req.path,
      method: req.method,
      stack: err.stack,
    });
  }

  // Send response
  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

// 404 handler middleware
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const err = new ApiError(404, `Resource not found - ${req.originalUrl}`);
  next(err);
};
