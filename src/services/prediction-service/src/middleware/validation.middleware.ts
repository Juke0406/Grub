import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ApiError } from "./error.middleware";

/**
 * Middleware to validate request using express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Format errors for response
      const formattedErrors = errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      }));

      // Return validation error response
      return next(new ApiError(400, "Validation error", formattedErrors));
    }

    next();
  };
};
