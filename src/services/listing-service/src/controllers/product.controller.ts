import { Request, Response } from "express";
import mongoose from "mongoose";
import Product, { ProductStatus } from "../models/product.model";
import Category from "../models/category.model";
import { ApiError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import {
  publishProductCreated,
  publishProductUpdated,
  publishProductDeleted,
} from "../kafka";

/**
 * Create a new product
 */
export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { businessId } = req.user!;

    // Create product with business ID from authenticated user
    const productData = {
      ...req.body,
      businessId,
      quantityRemaining: req.body.quantity, // Initially, remaining quantity equals total quantity
    };

    // Validate categories exist
    if (productData.categories && productData.categories.length > 0) {
      const categoryCount = await Category.countDocuments({
        _id: { $in: productData.categories },
      });

      if (categoryCount !== productData.categories.length) {
        throw new ApiError(400, "One or more categories do not exist");
      }
    }

    const product = new Product(productData);
    await product.save();

    // Publish product created event
    await publishProductCreated(product.toJSON());

    res.status(201).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }
};

/**
 * Get all products with filtering, sorting, and pagination
 */
export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "created_desc",
      status,
      category,
      businessId,
      businessType,
      minPrice,
      maxPrice,
      minDiscount,
      search,
      expiryBefore,
      expiryAfter,
      pickupBefore,
      pickupAfter,
    } = req.query;

    // Build filter object
    const filter: any = {};

    // Status filter
    if (status) {
      filter.status = status;
    } else {
      // By default, only show active products
      filter.status = ProductStatus.ACTIVE;
    }

    // Category filter
    if (category) {
      filter.categories = category;
    }

    // Business filter
    if (businessId) {
      filter.businessId = businessId;
    }

    // Business type filter
    if (businessType) {
      filter.businessType = businessType;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.discountedPrice = {};
      if (minPrice !== undefined) {
        filter.discountedPrice.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.discountedPrice.$lte = Number(maxPrice);
      }
    }

    // Discount percentage filter
    if (minDiscount !== undefined) {
      filter.discountPercentage = { $gte: Number(minDiscount) };
    }

    // Text search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Expiry date filter
    if (expiryBefore !== undefined || expiryAfter !== undefined) {
      filter.expiryDate = {};
      if (expiryBefore !== undefined) {
        filter.expiryDate.$lte = new Date(expiryBefore as string);
      }
      if (expiryAfter !== undefined) {
        filter.expiryDate.$gte = new Date(expiryAfter as string);
      }
    }

    // Pickup window filter
    if (pickupBefore !== undefined) {
      filter["pickupWindow.end"] = { $lte: new Date(pickupBefore as string) };
    }
    if (pickupAfter !== undefined) {
      filter["pickupWindow.start"] = { $gte: new Date(pickupAfter as string) };
    }

    // Determine sort order
    let sortOption = {};
    switch (sort) {
      case "price_asc":
        sortOption = { discountedPrice: 1 };
        break;
      case "price_desc":
        sortOption = { discountedPrice: -1 };
        break;
      case "discount_asc":
        sortOption = { discountPercentage: 1 };
        break;
      case "discount_desc":
        sortOption = { discountPercentage: -1 };
        break;
      case "expiry_asc":
        sortOption = { expiryDate: 1 };
        break;
      case "expiry_desc":
        sortOption = { expiryDate: -1 };
        break;
      case "created_asc":
        sortOption = { createdAt: 1 };
        break;
      case "created_desc":
      default:
        sortOption = { createdAt: -1 };
    }

    // Calculate pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate("categories", "name slug");

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching products:", error);
    throw error;
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate(
      "categories",
      "name slug"
    );

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid product ID");
    }
    throw error;
  }
};

/**
 * Update a product
 */
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { businessId } = req.user!;

    // Find product and check ownership
    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Check if user owns the product
    if (
      product.businessId.toString() !== businessId &&
      req.user!.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "You don't have permission to update this product"
      );
    }

    // Validate categories exist if provided
    if (req.body.categories && req.body.categories.length > 0) {
      const categoryCount = await Category.countDocuments({
        _id: { $in: req.body.categories },
      });

      if (categoryCount !== req.body.categories.length) {
        throw new ApiError(400, "One or more categories do not exist");
      }
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    // Publish product updated event
    await publishProductUpdated(updatedProduct!.toJSON());

    res.status(200).json({
      status: "success",
      data: updatedProduct,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new ApiError(400, error.message);
    } else if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid product ID");
    }
    throw error;
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { businessId } = req.user!;

    // Find product and check ownership
    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Check if user owns the product
    if (
      product.businessId.toString() !== businessId &&
      req.user!.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "You don't have permission to delete this product"
      );
    }

    // Delete product
    await Product.findByIdAndDelete(id);

    // Publish product deleted event
    await publishProductDeleted(id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid product ID");
    }
    throw error;
  }
};

/**
 * Update product quantity
 */
export const updateProductQuantity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const { businessId } = req.user!;

    if (quantity === undefined) {
      throw new ApiError(400, "Quantity is required");
    }

    // Find product and check ownership
    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    // Check if user owns the product
    if (
      product.businessId.toString() !== businessId &&
      req.user!.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "You don't have permission to update this product"
      );
    }

    // Update product quantity
    product.quantityRemaining = Math.min(quantity, product.quantity);

    // Update status if needed
    if (product.quantityRemaining <= 0) {
      product.status = ProductStatus.SOLD_OUT;
    } else if (product.status === ProductStatus.SOLD_OUT) {
      product.status = ProductStatus.ACTIVE;
    }

    await product.save();

    // Publish product updated event
    await publishProductUpdated(product.toJSON());

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new ApiError(400, error.message);
    } else if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid product ID");
    }
    throw error;
  }
};
