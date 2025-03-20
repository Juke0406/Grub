import { body, param, query } from "express-validator";
import { PredictionType } from "../models/prediction.model";

/**
 * Validator for creating a prediction
 */
export const createPredictionValidator = [
  body("businessId")
    .notEmpty()
    .withMessage("Business ID is required")
    .isString()
    .withMessage("Business ID must be a string"),

  body("type")
    .notEmpty()
    .withMessage("Prediction type is required")
    .isIn(Object.values(PredictionType))
    .withMessage("Invalid prediction type"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid ISO date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
];

/**
 * Validator for getting a prediction by ID
 */
export const getPredictionValidator = [
  param("id")
    .notEmpty()
    .withMessage("Prediction ID is required")
    .isMongoId()
    .withMessage("Invalid prediction ID format"),
];

/**
 * Validator for listing predictions
 */
export const listPredictionsValidator = [
  query("businessId")
    .notEmpty()
    .withMessage("Business ID is required")
    .isString()
    .withMessage("Business ID must be a string"),

  query("type")
    .optional()
    .isIn(Object.values(PredictionType))
    .withMessage("Invalid prediction type"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO date"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];
