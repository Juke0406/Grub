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
 * Middleware to authenticate JWT token
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    const token = authHeader.split(" ")[1];

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
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, "Invalid token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, "Token expired"));
    } else {
      logger.error("Auth middleware error:", error);
      next(error);
    }
  }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ApiError(401, "Authentication required");
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(
          403,
          "You don't have permission to access this resource"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is a business owner
 */
export const isBusinessOwner = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (req.user.role !== "business" && req.user.role !== "admin") {
      throw new ApiError(403, "Only business owners can access this resource");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is a supermarket
 */
export const isSupermarket = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (req.user.role !== "supermarket" && req.user.role !== "admin") {
      throw new ApiError(403, "Only supermarkets can access this resource");
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (req.user.role !== "admin") {
      throw new ApiError(403, "Admin privileges required");
    }

    next();
  } catch (error) {
    next(error);
  }
};
