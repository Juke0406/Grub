import Joi from "joi";
import { Request, Response, NextFunction } from "express";

/**
 * Validation schema for creating a new API key
 */
export const createApiKeySchema = Joi.object({
  userId: Joi.string().required().messages({
    "string.empty": "User ID is required",
    "any.required": "User ID is required",
  }),
  name: Joi.string().trim().max(100).messages({
    "string.max": "Name cannot exceed 100 characters",
  }),
  description: Joi.string().trim().max(500).messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  tier: Joi.string()
    .valid("standard", "premium", "enterprise")
    .default("standard")
    .messages({
      "any.only": "Tier must be one of: standard, premium, enterprise",
    }),
  expiresAt: Joi.date()
    .greater("now")
    .default(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    .messages({
      "date.greater": "Expiry date must be in the future",
    }),
  permissions: Joi.array().items(Joi.string()).default([]),
});

/**
 * Validation schema for updating an API key
 */
export const updateApiKeySchema = Joi.object({
  name: Joi.string().trim().max(100).messages({
    "string.max": "Name cannot exceed 100 characters",
  }),
  description: Joi.string().trim().max(500).messages({
    "string.max": "Description cannot exceed 500 characters",
  }),
  tier: Joi.string().valid("standard", "premium", "enterprise").messages({
    "any.only": "Tier must be one of: standard, premium, enterprise",
  }),
  isActive: Joi.boolean(),
  permissions: Joi.array().items(Joi.string()),
});

/**
 * Validation schema for API key ID
 */
export const apiKeyIdSchema = Joi.object({
  id: Joi.string().required().messages({
    "string.empty": "API key ID is required",
    "any.required": "API key ID is required",
  }),
});

/**
 * Validation schema for API key
 */
export const apiKeySchema = Joi.object({
  key: Joi.string().required().messages({
    "string.empty": "API key is required",
    "any.required": "API key is required",
  }),
});

/**
 * Validation schema for user ID
 */
export const userIdSchema = Joi.object({
  userId: Joi.string().required().messages({
    "string.empty": "User ID is required",
    "any.required": "User ID is required",
  }),
});

/**
 * Middleware to validate request body against a schema
 */
export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return res.status(400).json({ error: errorMessage });
    }

    // Replace request body with validated value
    req.body = value;
    next();
  };
};

/**
 * Middleware to validate request params against a schema
 */
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return res.status(400).json({ error: errorMessage });
    }

    // Replace request params with validated value
    req.params = value;
    next();
  };
};

/**
 * Middleware to validate request query against a schema
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return res.status(400).json({ error: errorMessage });
    }

    // Replace request query with validated value
    req.query = value;
    next();
  };
};
