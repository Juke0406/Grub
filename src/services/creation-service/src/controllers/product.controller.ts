import { Request, Response, NextFunction } from "express";
import { Product, ProductStatus } from "../models/product.model";
import { Category } from "../models/category.model";
import { Business } from "../models/business.model";
import mongoose from "mongoose";
import { logger } from "../utils/logger";
import { produceMessage } from "../kafka";
import { config } from "../config";

/**
 * Create a new product
 * @route POST /api/businesses/:businessId/products
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId } = req.params;

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Verify user has permission to create products for this business
    if (business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message:
          "You don't have permission to create products for this business",
      });
    }

    // Validate categories exist and belong to the business
    if (req.body.categories && req.body.categories.length > 0) {
      const categories = await Category.find({
        _id: { $in: req.body.categories },
        businessId,
      });

      if (categories.length !== req.body.categories.length) {
        return res.status(400).json({
          message:
            "One or more categories are invalid or don't belong to this business",
        });
      }
    }

    // Create new product
    const product = new Product({
      ...req.body,
      businessId,
      businessType: business.type,
      quantityRemaining: req.body.quantity, // Initially, remaining = total
      status: ProductStatus.ACTIVE,
    });

    await product.save();

    // Publish event to Kafka
    await produceMessage(config.productCreatedTopic, {
      productId: product._id.toString(),
      businessId: product.businessId.toString(),
      name: product.name,
      originalPrice: product.originalPrice,
      discountedPrice: product.discountedPrice,
      quantity: product.quantity,
      quantityRemaining: product.quantityRemaining,
      expiryDate: product.expiryDate,
      pickupWindow: product.pickupWindow,
      status: product.status,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Product created: ${product._id}`, {
      businessId,
      productId: product._id,
    });

    return res.status(201).json(product);
  } catch (error) {
    logger.error("Error creating product", { error });
    next(error);
  }
};

/**
 * Get all products for a business
 * @route GET /api/businesses/:businessId/products
 */
export const getBusinessProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 20, status, category } = req.query;

    // Build query
    const query: any = { businessId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by category if provided
    if (category) {
      query.categories = category;
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("categories", "name");

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    return res.status(200).json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error("Error getting business products", { error });
    next(error);
  }
};

/**
 * Get a single product by ID
 * @route GET /api/products/:productId
 */
export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate("categories", "name")
      .populate("businessId", "name type");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);
  } catch (error) {
    logger.error("Error getting product by ID", { error });
    next(error);
  }
};

/**
 * Update a product
 * @route PUT /api/products/:productId
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user has permission to update this product
    const business = await Business.findById(product.businessId);
    if (!business || business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to update this product",
      });
    }

    // Validate categories if provided
    if (updates.categories && updates.categories.length > 0) {
      const categories = await Category.find({
        _id: { $in: updates.categories },
        businessId: product.businessId,
      });

      if (categories.length !== updates.categories.length) {
        return res.status(400).json({
          message:
            "One or more categories are invalid or don't belong to this business",
        });
      }
    }

    // Handle quantity updates
    if (updates.quantity !== undefined) {
      // Calculate the difference between new and old quantity
      const quantityDiff = updates.quantity - product.quantity;

      // Update quantityRemaining proportionally
      updates.quantityRemaining = Math.max(
        0,
        product.quantityRemaining + quantityDiff
      );
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("categories", "name");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Publish event to Kafka
    await produceMessage(config.productUpdatedTopic, {
      productId: updatedProduct._id.toString(),
      businessId: updatedProduct.businessId.toString(),
      name: updatedProduct.name,
      originalPrice: updatedProduct.originalPrice,
      discountedPrice: updatedProduct.discountedPrice,
      quantity: updatedProduct.quantity,
      quantityRemaining: updatedProduct.quantityRemaining,
      expiryDate: updatedProduct.expiryDate,
      pickupWindow: updatedProduct.pickupWindow,
      status: updatedProduct.status,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Product updated: ${productId}`, { productId });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    logger.error("Error updating product", { error });
    next(error);
  }
};

/**
 * Delete a product
 * @route DELETE /api/products/:productId
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user has permission to delete this product
    const business = await Business.findById(product.businessId);
    if (!business || business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to delete this product",
      });
    }

    // Delete product
    await Product.findByIdAndDelete(productId);

    // Publish event to Kafka
    await produceMessage(config.productDeletedTopic, {
      productId: product._id.toString(),
      businessId: product.businessId.toString(),
      timestamp: new Date().toISOString(),
    });

    logger.info(`Product deleted: ${productId}`, { productId });

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    logger.error("Error deleting product", { error });
    next(error);
  }
};

/**
 * Update product status
 * @route PATCH /api/products/:productId/status
 */
export const updateProductStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const { status } = req.body;

    if (!Object.values(ProductStatus).includes(status as ProductStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user has permission to update this product
    const business = await Business.findById(product.businessId);
    if (!business || business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to update this product",
      });
    }

    // Update status
    product.status = status as ProductStatus;
    await product.save();

    // Publish event to Kafka
    await produceMessage(config.productUpdatedTopic, {
      productId: product._id.toString(),
      businessId: product.businessId.toString(),
      status: product.status,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Product status updated: ${productId}`, {
      productId,
      status,
    });

    return res.status(200).json({
      message: "Product status updated successfully",
      product,
    });
  } catch (error) {
    logger.error("Error updating product status", { error });
    next(error);
  }
};
