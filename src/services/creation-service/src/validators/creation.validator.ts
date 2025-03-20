import { body, param, query } from "express-validator";
import mongoose from "mongoose";

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (value: string) => {
  return mongoose.Types.ObjectId.isValid(value);
};

// Validate business ID
export const validateBusinessId = [
  param("businessId")
    .isString()
    .custom(isValidObjectId)
    .withMessage("Invalid business ID format"),
];

// Validate category ID
export const validateCategoryId = [
  param("categoryId")
    .isString()
    .custom(isValidObjectId)
    .withMessage("Invalid category ID format"),
];

// Validate product ID
export const validateProductId = [
  param("productId")
    .isString()
    .custom(isValidObjectId)
    .withMessage("Invalid product ID format"),
];

// Validate bundle ID
export const validateBundleId = [
  param("bundleId")
    .isString()
    .custom(isValidObjectId)
    .withMessage("Invalid bundle ID format"),
];

// Validate pagination parameters
export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

// Validate category creation/update
export const validateCategory = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be between 2 and 50 characters"),
  body("description")
    .isString()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
];

// Validate product creation/update
export const validateProduct = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be between 2 and 100 characters"),
  body("description")
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("businessType")
    .isString()
    .isIn(["bakery", "supermarket"])
    .withMessage("Business type must be either 'bakery' or 'supermarket'"),
  body("originalPrice")
    .isFloat({ min: 0 })
    .withMessage("Original price must be a positive number"),
  body("discountedPrice")
    .isFloat({ min: 0 })
    .withMessage("Discounted price must be a positive number")
    .custom((value, { req }) => {
      return value <= req.body.originalPrice;
    })
    .withMessage(
      "Discounted price must be less than or equal to original price"
    ),
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("categories")
    .isArray()
    .withMessage("Categories must be an array")
    .custom((value) => {
      if (!value.every(isValidObjectId)) {
        throw new Error("Invalid category ID format");
      }
      return true;
    }),
  body("images")
    .isArray()
    .withMessage("Images must be an array")
    .custom((value) => {
      if (
        !value.every((url: string) => /^(http|https):\/\/[^ "]+$/.test(url))
      ) {
        throw new Error("Invalid image URL format");
      }
      return true;
    }),
  body("expiryDate")
    .isISO8601()
    .withMessage("Expiry date must be a valid date")
    .custom((value) => {
      const date = new Date(value);
      return date > new Date();
    })
    .withMessage("Expiry date must be in the future"),
  body("pickupWindow.start")
    .isISO8601()
    .withMessage("Pickup window start must be a valid date")
    .custom((value) => {
      const date = new Date(value);
      return date > new Date();
    })
    .withMessage("Pickup window start must be in the future"),
  body("pickupWindow.end")
    .isISO8601()
    .withMessage("Pickup window end must be a valid date")
    .custom((value, { req }) => {
      const startDate = new Date(req.body.pickupWindow.start);
      const endDate = new Date(value);
      return endDate > startDate;
    })
    .withMessage("Pickup window end must be after start time"),
];

// Validate bundle creation/update
export const validateBundle = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Bundle name must be between 2 and 100 characters"),
  body("description")
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("originalPrice")
    .isFloat({ min: 0 })
    .withMessage("Original price must be a positive number"),
  body("discountedPrice")
    .isFloat({ min: 0 })
    .withMessage("Discounted price must be a positive number")
    .custom((value, { req }) => {
      return value <= req.body.originalPrice;
    })
    .withMessage(
      "Discounted price must be less than or equal to original price"
    ),
  body("products")
    .isArray({ min: 1 })
    .withMessage("Bundle must contain at least one product"),
  body("products.*.productId")
    .isString()
    .custom(isValidObjectId)
    .withMessage("Invalid product ID format"),
  body("products.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Product quantity must be a positive integer"),
  body("totalQuantity")
    .isInt({ min: 1 })
    .withMessage("Total quantity must be a positive integer"),
  body("images")
    .isArray()
    .withMessage("Images must be an array")
    .custom((value) => {
      if (
        !value.every((url: string) => /^(http|https):\/\/[^ "]+$/.test(url))
      ) {
        throw new Error("Invalid image URL format");
      }
      return true;
    }),
  body("expiryDate")
    .isISO8601()
    .withMessage("Expiry date must be a valid date")
    .custom((value) => {
      const date = new Date(value);
      return date > new Date();
    })
    .withMessage("Expiry date must be in the future"),
  body("pickupWindow.start")
    .isISO8601()
    .withMessage("Pickup window start must be a valid date")
    .custom((value) => {
      const date = new Date(value);
      return date > new Date();
    })
    .withMessage("Pickup window start must be in the future"),
  body("pickupWindow.end")
    .isISO8601()
    .withMessage("Pickup window end must be a valid date")
    .custom((value, { req }) => {
      const startDate = new Date(req.body.pickupWindow.start);
      const endDate = new Date(value);
      return endDate > startDate;
    })
    .withMessage("Pickup window end must be after start time"),
];

// Validate business creation/update
export const validateBusiness = [
  body("name")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Business name must be between 2 and 100 characters"),
  body("type")
    .isString()
    .isIn(["bakery", "supermarket"])
    .withMessage("Business type must be either 'bakery' or 'supermarket'"),
  body("description")
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("address.street")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Street address is required"),
  body("address.city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("address.state")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("State is required"),
  body("address.postalCode")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Postal code is required"),
  body("address.country")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Country is required"),
  body("contactInfo.email").isEmail().withMessage("Valid email is required"),
  body("contactInfo.phone")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
  body("contactInfo.website")
    .optional()
    .isURL()
    .withMessage("Website must be a valid URL"),
  body("operatingHours")
    .isObject()
    .withMessage("Operating hours must be provided"),
];

// Validate image upload
export const validateImageUpload = [
  body("businessId")
    .optional()
    .isString()
    .custom(isValidObjectId)
    .withMessage("Invalid business ID format"),
  body("productId")
    .optional()
    .isString()
    .custom(isValidObjectId)
    .withMessage("Invalid product ID format"),
  body("bundleId")
    .optional()
    .isString()
    .custom(isValidObjectId)
    .withMessage("Invalid bundle ID format"),
];
