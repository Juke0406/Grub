import Joi from "joi";

// Product validation schemas
export const createProductSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(1000).required(),
  businessType: Joi.string().valid("bakery", "supermarket").required(),
  originalPrice: Joi.number().min(0).required(),
  discountedPrice: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(1).required(),
  categories: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
  images: Joi.array().items(Joi.string().uri()),
  expiryDate: Joi.date().greater("now").required(),
  pickupWindow: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().greater(Joi.ref("start")).required(),
  }).required(),
}).custom((value, helpers) => {
  if (value.discountedPrice > value.originalPrice) {
    return helpers.error("custom.pricing", {
      message: "Discounted price cannot be greater than original price",
    });
  }
  return value;
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().max(100),
  description: Joi.string().trim().max(1000),
  originalPrice: Joi.number().min(0),
  discountedPrice: Joi.number().min(0),
  quantity: Joi.number().integer().min(0),
  categories: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
  images: Joi.array().items(Joi.string().uri()),
  expiryDate: Joi.date().greater("now"),
  pickupWindow: Joi.object({
    start: Joi.date(),
    end: Joi.date().greater(Joi.ref("start")),
  }),
  status: Joi.string().valid("active", "sold_out", "expired", "draft"),
}).custom((value, helpers) => {
  if (
    value.discountedPrice &&
    value.originalPrice &&
    value.discountedPrice > value.originalPrice
  ) {
    return helpers.error("custom.pricing", {
      message: "Discounted price cannot be greater than original price",
    });
  }
  return value;
});

// Category validation schemas
export const createCategorySchema = Joi.object({
  name: Joi.string().trim().max(50).required(),
  description: Joi.string().trim().max(500),
  slug: Joi.string().trim().lowercase(),
  parentCategory: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  isGlobal: Joi.boolean().default(false),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().max(50),
  description: Joi.string().trim().max(500),
  slug: Joi.string().trim().lowercase(),
  parentCategory: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  isGlobal: Joi.boolean(),
});

// Bundle validation schemas
export const createBundleSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  description: Joi.string().trim().max(1000).required(),
  originalPrice: Joi.number().min(0).required(),
  discountedPrice: Joi.number().min(0).required(),
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  totalQuantity: Joi.number().integer().min(1).required(),
  images: Joi.array().items(Joi.string().uri()),
  expiryDate: Joi.date().greater("now").required(),
  pickupWindow: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().greater(Joi.ref("start")).required(),
  }).required(),
}).custom((value, helpers) => {
  if (value.discountedPrice > value.originalPrice) {
    return helpers.error("custom.pricing", {
      message: "Discounted price cannot be greater than original price",
    });
  }
  return value;
});

export const updateBundleSchema = Joi.object({
  name: Joi.string().trim().max(100),
  description: Joi.string().trim().max(1000),
  originalPrice: Joi.number().min(0),
  discountedPrice: Joi.number().min(0),
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1),
  totalQuantity: Joi.number().integer().min(0),
  images: Joi.array().items(Joi.string().uri()),
  expiryDate: Joi.date().greater("now"),
  pickupWindow: Joi.object({
    start: Joi.date(),
    end: Joi.date().greater(Joi.ref("start")),
  }),
  status: Joi.string().valid("active", "sold_out", "expired", "draft"),
}).custom((value, helpers) => {
  if (
    value.discountedPrice &&
    value.originalPrice &&
    value.discountedPrice > value.originalPrice
  ) {
    return helpers.error("custom.pricing", {
      message: "Discounted price cannot be greater than original price",
    });
  }
  return value;
});

// Query validation schemas
export const listProductsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string()
    .valid(
      "price_asc",
      "price_desc",
      "discount_asc",
      "discount_desc",
      "expiry_asc",
      "expiry_desc",
      "created_asc",
      "created_desc"
    )
    .default("created_desc"),
  status: Joi.string().valid("active", "sold_out", "expired", "draft"),
  category: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  businessId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  businessType: Joi.string().valid("bakery", "supermarket"),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  minDiscount: Joi.number().min(0).max(100),
  search: Joi.string().trim().max(100),
  expiryBefore: Joi.date(),
  expiryAfter: Joi.date(),
  pickupBefore: Joi.date(),
  pickupAfter: Joi.date(),
}).custom((value, helpers) => {
  if (value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
    return helpers.error("custom.pricing", {
      message: "Minimum price cannot be greater than maximum price",
    });
  }
  return value;
});
