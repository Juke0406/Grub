import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { getRedisClient } from "../redis";
import config from "../config";
import { logger } from "../utils/logger";
import ApiKey from "../models/api-key.model";

/**
 * Create a rate limiter middleware with Redis store
 */
export const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      // @ts-ignore - Type definitions mismatch between packages
      sendCommand: (...args: any[]) => getRedisClient().sendCommand(args),
    }),
    keyGenerator: (req: Request) => {
      // Use API key as the rate limit key if available
      const apiKey = req.get("X-API-Key") || (req.query.api_key as string);
      if (apiKey) {
        return `rate-limit:${apiKey}`;
      }

      // Fall back to IP address
      return `rate-limit:${req.ip}`;
    },
    handler: (req: Request, res: Response) => {
      logger.warn(`Rate limit exceeded for ${req.ip}`);
      return res.status(429).json({
        error: "Too many requests, please try again later.",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

/**
 * Default rate limiter for general API endpoints
 */
export const defaultRateLimiter = createRateLimiter(
  config.rateLimitWindowMs,
  config.rateLimitMaxRequests
);

/**
 * Dynamic rate limiter based on API key tier
 */
export const dynamicRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get API key from header or query parameter
    const apiKey = req.get("X-API-Key") || (req.query.api_key as string);

    if (!apiKey) {
      // No API key provided, use default rate limit
      return defaultRateLimiter(req, res, next);
    }

    // Find API key in database
    const keyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });

    if (!keyDoc || keyDoc.expiresAt < new Date()) {
      return res.status(401).json({ error: "Invalid or expired API key" });
    }

    // Update last used timestamp and usage count
    keyDoc.lastUsedAt = new Date();
    keyDoc.usageCount += 1;
    await keyDoc.save();

    // Set rate limit based on tier
    let rateLimit: number;

    switch (keyDoc.tier) {
      case "premium":
        rateLimit = config.rateLimitPremiumTier;
        break;
      case "enterprise":
        rateLimit = config.rateLimitEnterpriseTier;
        break;
      case "standard":
      default:
        rateLimit = config.rateLimitStandardTier;
        break;
    }

    // Add tier and rate limit info to response headers
    res.setHeader("X-Rate-Limit-Tier", keyDoc.tier);
    res.setHeader("X-Rate-Limit-Limit", rateLimit.toString());

    // Store API key in request for later use
    req.apiKey = keyDoc;

    // Apply rate limiter with tier-specific limit
    return createRateLimiter(config.rateLimitWindowMs, rateLimit)(
      req,
      res,
      next
    );
  } catch (error) {
    logger.error(`Error in dynamic rate limiter: ${error}`);
    return next(error);
  }
};
