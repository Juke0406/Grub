import { Request, Response, NextFunction } from "express";
import { Schema } from "joi";
import { ApiError } from "./error.middleware";

/**
 * Middleware to validate request data against a Joi schema
 */
export const validateRequest = (
  schema: Schema,
  property: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = `Validation error: ${error.details
        .map((detail) => detail.message)
        .join(", ")}`;

      next(new ApiError(400, errorMessage));
    } else {
      next();
    }
  };
};
