import { Router } from "express";
import {
  generatePrediction,
  getPrediction,
  listPredictions,
} from "../controllers/prediction.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  createPredictionValidator,
  getPredictionValidator,
  listPredictionsValidator,
} from "../validators/prediction.validator";

const router = Router();

/**
 * @route POST /api/predictions/v1
 * @desc Generate a new prediction
 * @access Private (Business owners and admins)
 */
router.post(
  "/",
  authenticate,
  authorize(["business", "admin"]),
  validate(createPredictionValidator),
  generatePrediction
);

/**
 * @route GET /api/predictions/v1/:id
 * @desc Get a prediction by ID
 * @access Private (Business owners and admins)
 */
router.get(
  "/:id",
  authenticate,
  validate(getPredictionValidator),
  getPrediction
);

/**
 * @route GET /api/predictions/v1
 * @desc List predictions for a business
 * @access Private (Business owners and admins)
 */
router.get(
  "/",
  authenticate,
  validate(listPredictionsValidator),
  listPredictions
);

export default router;
