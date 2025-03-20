import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { ApiError } from "./error.middleware";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "Authentication token missing");
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = decoded;
      next();
    } catch (error) {
      if ((error as Error).name === "TokenExpiredError") {
        throw new ApiError(401, "Token expired");
      }
      throw new ApiError(401, "Invalid token");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You don't have permission to access this resource")
      );
    }

    next();
  };
};

/**
 * Middleware to check if user belongs to the business
 */
export const belongsToBusiness = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const businessId = req.params.businessId || req.body.businessId;

    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    // Skip check for admin users
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user belongs to the business
    if (req.user.businessId !== businessId) {
      throw new ApiError(403, "You don't have access to this business data");
    }

    next();
  } catch (error) {
    next(error);
  }
};
