import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenType } from "../services/token.service";
import { ApiError } from "./error.middleware";
import { asyncHandler } from "./error.middleware";
import { logger } from "../utils/logger";

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

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      throw new ApiError(401, "Invalid or expired token");
    }

    // Check token type
    if (payload.type !== TokenType.ACCESS) {
      throw new ApiError(401, "Invalid token type");
    }

    // Attach user data to request
    req.body.userId = payload.userId;
    req.body.userEmail = payload.email;
    req.body.userRole = payload.role;

    // Log authentication
    logger.debug("User authenticated", {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    next();
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
