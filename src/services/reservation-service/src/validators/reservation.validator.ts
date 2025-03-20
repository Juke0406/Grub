import Joi from "joi";
import { ReservationStatus } from "../models/reservation.model";

// Reservation item validation schema
const reservationItemSchema = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "Product ID is required",
  }),
  name: Joi.string().required().messages({
    "any.required": "Product name is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
  originalPrice: Joi.number().min(0).required().messages({
    "number.base": "Original price must be a number",
    "number.min": "Original price must be at least 0",
    "any.required": "Original price is required",
  }),
  discountPercentage: Joi.number().min(0).max(100).required().messages({
    "number.base": "Discount percentage must be a number",
    "number.min": "Discount percentage must be at least 0",
    "number.max": "Discount percentage cannot exceed 100",
    "any.required": "Discount percentage is required",
  }),
});

// Create reservation validation schema
export const createReservationSchema = Joi.object({
  storeName: Joi.string().required().messages({
    "any.required": "Store name is required",
  }),
  storeLocation: Joi.string().required().messages({
    "any.required": "Store location is required",
  }),
  items: Joi.array().items(reservationItemSchema).min(1).required().messages({
    "array.base": "Items must be an array",
    "array.min": "At least one item is required",
    "any.required": "Items are required",
  }),
  pickupTime: Joi.string().isoDate().required().messages({
    "string.isoDate": "Pickup time must be a valid ISO date string",
    "any.required": "Pickup time is required",
  }),
  pickupEndTime: Joi.string().isoDate().required().messages({
    "string.isoDate": "Pickup end time must be a valid ISO date string",
    "any.required": "Pickup end time is required",
  }),
});

// Update reservation status validation schema
export const updateReservationStatusSchema = Joi.object({
  reservationId: Joi.string().required().messages({
    "any.required": "Reservation ID is required",
  }),
  status: Joi.string()
    .valid(...Object.values(ReservationStatus))
    .required()
    .messages({
      "any.only": `Status must be one of: ${Object.values(
        ReservationStatus
      ).join(", ")}`,
      "any.required": "Status is required",
    }),
});

// Add rating validation schema
export const addRatingSchema = Joi.object({
  reservationId: Joi.string().required().messages({
    "any.required": "Reservation ID is required",
  }),
  rating: Joi.object({
    score: Joi.number().integer().min(1).max(5).required().messages({
      "number.base": "Rating score must be a number",
      "number.integer": "Rating score must be an integer",
      "number.min": "Rating score must be at least 1",
      "number.max": "Rating score cannot exceed 5",
      "any.required": "Rating score is required",
    }),
    comment: Joi.string().optional(),
  })
    .required()
    .messages({
      "any.required": "Rating is required",
    }),
});

// Get reservations validation schema
export const getReservationsSchema = Joi.object({
  status: Joi.string().optional(),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional()
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),
  page: Joi.number().integer().min(1).default(1).optional().messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
});
