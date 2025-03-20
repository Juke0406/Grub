import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { ApiError } from "./error.middleware";
import { logger } from "../utils/logger";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        businessId?: string;
      };
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
      throw new ApiError(401, "Invalid token format");
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as {
        id: string;
        role: string;
        businessId?: string;
      };

      // Attach user info to request
      req.user = {
        id: decoded.id,
        role: decoded.role,
        businessId: decoded.businessId,
      };

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
 * Middleware to authorize based on user roles
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication required");
      }

      if (!roles.includes(req.user.role)) {
        logger.warn(
          `Unauthorized access attempt: User ${req.user.id} with role ${
            req.user.role
          } tried to access a resource restricted to ${roles.join(", ")}`
        );
        throw new ApiError(403, "Insufficient permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to ensure user belongs to the business they're modifying
 */
export const ensureBusinessAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    // Admin can access any business
    if (req.user.role === "admin") {
      return next();
    }

    // Get businessId from request params or body
    const businessId = req.params.businessId || req.body.businessId;

    // If no businessId in request, skip this check
    if (!businessId) {
      return next();
    }

    // Check if user belongs to the business
    if (req.user.businessId !== businessId) {
      logger.warn(
        `Business access violation: User ${req.user.id} tried to access business ${businessId} but belongs to ${req.user.businessId}`
      );
      throw new ApiError(403, "You can only manage your own business");
    }

    next();
  } catch (error) {
    next(error);
  }
};
