import express from "express";
import {
  createApiKey,
  getApiKeys,
  getApiKeyById,
  updateApiKey,
  deleteApiKey,
  verifyApiKey,
} from "../controllers/api-key.controller";
import {
  authenticateJwt,
  authenticateApiKey,
  requireRole,
} from "../middleware/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
  createApiKeySchema,
  updateApiKeySchema,
  apiKeyIdSchema,
  apiKeySchema,
  userIdSchema,
} from "../validators/api-key.validator";
import {
  dynamicRateLimiter,
  defaultRateLimiter,
} from "../middleware/rate-limiter.middleware";

const router = express.Router();

/**
 * API Key Routes
 */
// Create a new API key (requires JWT authentication)
router.post(
  "/api-keys",
  authenticateJwt,
  validateBody(createApiKeySchema),
  createApiKey
);

// Get all API keys for a user (requires JWT authentication)
router.get(
  "/api-keys",
  authenticateJwt,
  validateQuery(userIdSchema),
  getApiKeys
);

// Get API key by ID (requires JWT authentication)
router.get(
  "/api-keys/:id",
  authenticateJwt,
  validateParams(apiKeyIdSchema),
  getApiKeyById
);

// Update API key (requires JWT authentication)
router.patch(
  "/api-keys/:id",
  authenticateJwt,
  validateParams(apiKeyIdSchema),
  validateBody(updateApiKeySchema),
  updateApiKey
);

// Delete API key (requires JWT authentication)
router.delete(
  "/api-keys/:id",
  authenticateJwt,
  validateParams(apiKeyIdSchema),
  deleteApiKey
);

// Verify API key (public endpoint with rate limiting)
router.post(
  "/api-keys/verify",
  defaultRateLimiter,
  validateBody(apiKeySchema),
  verifyApiKey
);

/**
 * API Gateway Routes
 * These routes proxy requests to other microservices
 */

// Authentication Service Routes
router.use(
  "/auth",
  dynamicRateLimiter,
  // Proxy to auth service
  (req, res) => {
    // This would be implemented with a proper proxy
    res.status(501).json({ error: "Not implemented" });
  }
);

// Reservation Service Routes
router.use(
  "/reservations",
  authenticateApiKey,
  dynamicRateLimiter,
  // Proxy to reservation service
  (req, res) => {
    // This would be implemented with a proper proxy
    res.status(501).json({ error: "Not implemented" });
  }
);

// Listing Service Routes
router.use(
  "/listings",
  authenticateApiKey,
  dynamicRateLimiter,
  // Proxy to listing service
  (req, res) => {
    // This would be implemented with a proper proxy
    res.status(501).json({ error: "Not implemented" });
  }
);

// Prediction Service Routes
router.use(
  "/predictions",
  authenticateApiKey,
  dynamicRateLimiter,
  // Proxy to prediction service
  (req, res) => {
    // This would be implemented with a proper proxy
    res.status(501).json({ error: "Not implemented" });
  }
);

// Creation Service Routes
router.use(
  "/creation",
  authenticateApiKey,
  dynamicRateLimiter,
  // Proxy to creation service
  (req, res) => {
    // This would be implemented with a proper proxy
    res.status(501).json({ error: "Not implemented" });
  }
);

// ML Service Routes
router.use(
  "/ml",
  authenticateApiKey,
  dynamicRateLimiter,
  // Proxy to ML service
  (req, res) => {
    // This would be implemented with a proper proxy
    res.status(501).json({ error: "Not implemented" });
  }
);

// Integration API for supermarkets
router.use(
  "/integration",
  authenticateApiKey,
  dynamicRateLimiter,
  // Proxy to appropriate service based on the request
  (req, res) => {
    // This would be implemented with a proper proxy
    res.status(501).json({ error: "Not implemented" });
  }
);

export default router;
