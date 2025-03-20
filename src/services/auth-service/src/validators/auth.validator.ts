import Joi from "joi";
import { UserRole } from "../models/user.model";

// Register validation schema
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
  firstName: Joi.string().required().messages({
    "any.required": "First name is required",
  }),
  lastName: Joi.string().required().messages({
    "any.required": "Last name is required",
  }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default(UserRole.CONSUMER)
    .messages({
      "any.only": "Role must be one of: consumer, bakery, supermarket, admin",
    }),
  businessName: Joi.string()
    .when("role", {
      is: Joi.valid(UserRole.BAKERY, UserRole.SUPERMARKET),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.required":
        "Business name is required for bakery and supermarket roles",
    }),
  businessAddress: Joi.string()
    .when("role", {
      is: Joi.valid(UserRole.BAKERY, UserRole.SUPERMARKET),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.required":
        "Business address is required for bakery and supermarket roles",
    }),
  phoneNumber: Joi.string().optional(),
});

// Login validation schema
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// Refresh token validation schema
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Refresh token is required",
  }),
});

// Update profile validation schema
export const updateProfileSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  businessName: Joi.string().optional(),
  businessAddress: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Change password validation schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "any.required": "Current password is required",
  }),
  newPassword: Joi.string().min(8).required().messages({
    "string.min": "New password must be at least 8 characters long",
    "any.required": "New password is required",
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Password confirmation is required",
    }),
});
