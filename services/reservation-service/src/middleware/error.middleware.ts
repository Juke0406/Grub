import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { config } from "../config";

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  logger.error("Error occurred:", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Default status code and message
  let statusCode = 500;
  let message = "Internal Server Error";

  // If it's our ApiError, use its status code and message
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "ValidationError") {
    // Handle mongoose validation errors
    statusCode = 400;
    message = err.message;
  } else if (err.name === "UnauthorizedError") {
    // Handle JWT authentication errors
    statusCode = 401;
    message = "Unauthorized";
  }

  // Send error response
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    // Include stack trace in development mode
    ...(config.nodeEnv !== "production" && { stack: err.stack }),
  });
};

// Not found middleware
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

// Async handler to catch errors in async route handlers
export const asyncHandler =
  (fn: Function) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
