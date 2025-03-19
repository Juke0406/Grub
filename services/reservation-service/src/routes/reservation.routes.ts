import { Router } from "express";
import {
  getReservations,
  getReservation,
  createReservation,
  updateReservationStatus,
  addRating,
} from "../controllers/reservation.controller";
import { validateRequest } from "../middleware/validation.middleware";
import { authenticate } from "../middleware/auth.middleware";
import {
  createReservationSchema,
  updateReservationStatusSchema,
  addRatingSchema,
  getReservationsSchema,
} from "../validators/reservation.validator";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all reservations for a user
router.get("/", validateRequest(getReservationsSchema), getReservations);

// Get a single reservation
router.get("/:id", getReservation);

// Create a new reservation
router.post("/", validateRequest(createReservationSchema), createReservation);

// Update reservation status
router.patch(
  "/:id/status",
  validateRequest(updateReservationStatusSchema),
  updateReservationStatus
);

// Add rating to a completed reservation
router.post("/:id/rating", validateRequest(addRatingSchema), addRating);

export default router;
