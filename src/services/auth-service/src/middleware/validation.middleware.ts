import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import { ApiError } from "./error.middleware";

/**
 * Validate request middleware
 * Uses Joi schema to validate request body, query, or params
 */
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return next(new ApiError(400, errorMessage));
    }

    next();
  };
};
