import { Request, Response } from "express";
import crypto from "crypto";
import ApiKey from "../models/api-key.model";
import { logger } from "../utils/logger";
import { cacheApiKey, removeApiKeyFromCache } from "../redis";
import {
  sendApiKeyCreatedEvent,
  sendApiKeyDeletedEvent,
  sendApiKeyUpdatedEvent,
} from "../kafka";

/**
 * Create a new API key
 * @route POST /api/v1/api-keys
 */
export const createApiKey = async (req: Request, res: Response) => {
  try {
    const { userId, name, description, tier, expiresAt, permissions } =
      req.body;

    // Generate a random API key
    const key = crypto.randomBytes(32).toString("hex");

    // Create new API key document
    const apiKey = new ApiKey({
      key,
      userId,
      name,
      description,
      tier: tier || "standard",
      expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      usageCount: 0,
      isActive: true,
      permissions: permissions || [],
    });

    // Save to database
    await apiKey.save();

    // Cache API key
    await cacheApiKey(key, userId, apiKey.expiresAt);

    // Send event to Kafka
    await sendApiKeyCreatedEvent(apiKey);

    logger.info(`API key created for user ${userId}`);

    // Return the API key (only returned once at creation)
    return res.status(201).json({
      message: "API key created successfully",
      key,
      id: apiKey._id,
      expiresAt: apiKey.expiresAt,
      tier: apiKey.tier,
      name: apiKey.name,
      description: apiKey.description,
      permissions: apiKey.permissions,
    });
  } catch (error) {
    logger.error(`Error creating API key: ${error}`);
    return res.status(500).json({ error: "Failed to create API key" });
  }
};

/**
 * Get all API keys for a user
 * @route GET /api/v1/api-keys
 */
export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find all active API keys for the user
    const apiKeys = await ApiKey.find({ userId, isActive: true })
      .select("-key") // Don't return the actual key
      .sort({ createdAt: -1 });

    return res.json(apiKeys);
  } catch (error) {
    logger.error(`Error getting API keys: ${error}`);
    return res.status(500).json({ error: "Failed to get API keys" });
  }
};

/**
 * Get API key by ID
 * @route GET /api/v1/api-keys/:id
 */
export const getApiKeyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find API key by ID
    const apiKey = await ApiKey.findById(id).select("-key");

    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    // Check if user is authorized to access this API key
    if (req.user && apiKey.userId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized access to API key" });
    }

    return res.json(apiKey);
  } catch (error) {
    logger.error(`Error getting API key: ${error}`);
    return res.status(500).json({ error: "Failed to get API key" });
  }
};

/**
 * Update API key
 * @route PATCH /api/v1/api-keys/:id
 */
export const updateApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, tier, isActive, permissions } = req.body;

    // Find API key by ID
    const apiKey = await ApiKey.findById(id);

    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    // Check if user is authorized to update this API key
    if (req.user && apiKey.userId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized access to API key" });
    }

    // Update fields
    if (name !== undefined) apiKey.name = name;
    if (description !== undefined) apiKey.description = description;
    if (tier !== undefined) apiKey.tier = tier;
    if (isActive !== undefined) apiKey.isActive = isActive;
    if (permissions !== undefined) apiKey.permissions = permissions;

    // Save changes
    await apiKey.save();

    // Send event to Kafka
    await sendApiKeyUpdatedEvent(apiKey);

    logger.info(`API key ${id} updated`);

    return res.json({
      message: "API key updated successfully",
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        description: apiKey.description,
        tier: apiKey.tier,
        isActive: apiKey.isActive,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        usageCount: apiKey.usageCount,
        lastUsedAt: apiKey.lastUsedAt,
      },
    });
  } catch (error) {
    logger.error(`Error updating API key: ${error}`);
    return res.status(500).json({ error: "Failed to update API key" });
  }
};

/**
 * Delete API key
 * @route DELETE /api/v1/api-keys/:id
 */
export const deleteApiKey = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find API key by ID
    const apiKey = await ApiKey.findById(id);

    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    // Check if user is authorized to delete this API key
    if (req.user && apiKey.userId !== req.user.userId) {
      return res.status(403).json({ error: "Unauthorized access to API key" });
    }

    // Remove from cache
    await removeApiKeyFromCache(apiKey.key);

    // Delete from database
    await ApiKey.deleteOne({ _id: id });

    // Send event to Kafka
    await sendApiKeyDeletedEvent(id);

    logger.info(`API key ${id} deleted`);

    return res.json({ message: "API key deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting API key: ${error}`);
    return res.status(500).json({ error: "Failed to delete API key" });
  }
};

/**
 * Verify API key
 * @route POST /api/v1/api-keys/verify
 */
export const verifyApiKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: "API key is required" });
    }

    // Find API key
    const apiKey = await ApiKey.findOne({ key, isActive: true });

    if (!apiKey) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Check if expired
    if (apiKey.expiresAt < new Date()) {
      return res.status(401).json({ error: "API key has expired" });
    }

    // Update last used timestamp and usage count
    apiKey.lastUsedAt = new Date();
    apiKey.usageCount += 1;
    await apiKey.save();

    return res.json({
      valid: true,
      userId: apiKey.userId,
      tier: apiKey.tier,
      permissions: apiKey.permissions,
    });
  } catch (error) {
    logger.error(`Error verifying API key: ${error}`);
    return res.status(500).json({ error: "Failed to verify API key" });
  }
};
