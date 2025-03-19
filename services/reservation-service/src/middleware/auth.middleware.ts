import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { ApiError } from "./error.middleware";
import { asyncHandler } from "./error.middleware";
import { logger } from "../utils/logger";

// JWT payload interface
interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication required");
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "Authentication token required");
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

      // Attach user data to request
      req.body.userId = decoded.userId;
      req.body.userEmail = decoded.email;
      req.body.userRole = decoded.role;

      // Log authentication
      logger.debug("User authenticated", {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });

      next();
    } catch (error) {
      logger.error("Token verification failed:", error);
      throw new ApiError(401, "Invalid or expired token");
    }
  }
);

/**
 * Role-based authorization middleware
 * Checks if user has required role
 */
export const authorize = (roles: string[]) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // User should be authenticated first
      if (!req.body.userId || !req.body.userRole) {
        throw new ApiError(401, "Authentication required");
      }

      // Check if user role is in allowed roles
      if (!roles.includes(req.body.userRole)) {
        throw new ApiError(403, "Insufficient permissions");
      }

      next();
    }
  );
};
