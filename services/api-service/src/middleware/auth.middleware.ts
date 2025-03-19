import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { logger } from "../utils/logger";
import ApiKey from "../models/api-key.model";
import { getApiKeyFromCache, cacheApiKey } from "../redis";

/**
 * Interface for JWT payload
 */
interface JwtPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticateJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }

    logger.error(`Error authenticating JWT: ${error}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Middleware to authenticate requests using API key
 */
export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get API key from header or query parameter
    const apiKey =
      (req.headers["x-api-key"] as string) || (req.query.api_key as string);

    if (!apiKey) {
      return res.status(401).json({ error: "API key is required" });
    }

    // Try to get API key from cache first
    let apiKeyData = await getApiKeyFromCache(apiKey);
    let userId: string;

    if (apiKeyData) {
      // API key found in cache
      userId = apiKeyData.userId;

      // Check if expired
      if (new Date(apiKeyData.expiresAt) < new Date()) {
        return res.status(401).json({ error: "API key has expired" });
      }
    } else {
      // API key not in cache, check database
      const keyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });

      if (!keyDoc) {
        return res.status(401).json({ error: "Invalid API key" });
      }

      // Check if expired
      if (keyDoc.expiresAt < new Date()) {
        return res.status(401).json({ error: "API key has expired" });
      }

      userId = keyDoc.userId;

      // Cache API key for future requests
      await cacheApiKey(apiKey, userId, keyDoc.expiresAt);

      // Update last used timestamp and usage count
      keyDoc.lastUsedAt = new Date();
      keyDoc.usageCount += 1;
      await keyDoc.save();
    }

    // Add user info to request
    req.user = {
      userId,
      apiKey,
    };

    next();
  } catch (error) {
    logger.error(`Error authenticating API key: ${error}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

/**
 * Middleware to check if user has required permissions
 */
export const requirePermission = (permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // If using API key, check permissions
      if (req.user.apiKey) {
        const apiKey = await ApiKey.findOne({ key: req.user.apiKey });

        if (!apiKey) {
          return res.status(401).json({ error: "Invalid API key" });
        }

        // Check if API key has all required permissions
        const hasAllPermissions = permissions.every((permission) =>
          apiKey.permissions.includes(permission)
        );

        if (!hasAllPermissions) {
          return res
            .status(403)
            .json({ error: "API key does not have required permissions" });
        }
      }

      next();
    } catch (error) {
      logger.error(`Error checking permissions: ${error}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role?: string;
        apiKey?: string;
      };
      apiKey?: any;
    }
  }
}
