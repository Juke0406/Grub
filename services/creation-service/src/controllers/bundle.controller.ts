import { Request, Response, NextFunction } from "express";
import { Bundle } from "../models/bundle.model";
import { Product, ProductStatus } from "../models/product.model";
import { Business } from "../models/business.model";
import mongoose from "mongoose";
import { logger } from "../utils/logger";
import { produceMessage } from "../kafka";
import { config } from "../config";

/**
 * Create a new bundle
 * @route POST /api/businesses/:businessId/bundles
 */
export const createBundle = async (
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

    // Verify user has permission to create bundles for this business
    if (business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message:
          "You don't have permission to create bundles for this business",
      });
    }

    // Validate products exist and belong to the business
    if (!req.body.products || req.body.products.length === 0) {
      return res
        .status(400)
        .json({ message: "Bundle must contain at least one product" });
    }

    const productIds = req.body.products.map((p: any) => p.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      businessId,
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message:
          "One or more products are invalid or don't belong to this business",
      });
    }

    // Check if all products have enough quantity
    for (const bundleProduct of req.body.products) {
      const product = products.find(
        (p) => p._id.toString() === bundleProduct.productId
      );
      if (!product) continue; // Already checked above

      if (
        product.quantityRemaining <
        bundleProduct.quantity * req.body.totalQuantity
      ) {
        return res.status(400).json({
          message: `Not enough quantity available for product ${product.name}`,
        });
      }
    }

    // Create new bundle
    const bundle = new Bundle({
      ...req.body,
      businessId,
      quantityRemaining: req.body.totalQuantity, // Initially, remaining = total
      status: ProductStatus.ACTIVE,
    });

    await bundle.save();

    // Publish event to Kafka
    await produceMessage(config.bundleCreatedTopic, {
      bundleId: bundle._id.toString(),
      businessId: bundle.businessId.toString(),
      name: bundle.name,
      originalPrice: bundle.originalPrice,
      discountedPrice: bundle.discountedPrice,
      products: bundle.products,
      totalQuantity: bundle.totalQuantity,
      quantityRemaining: bundle.quantityRemaining,
      expiryDate: bundle.expiryDate,
      pickupWindow: bundle.pickupWindow,
      status: bundle.status,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Bundle created: ${bundle._id}`, {
      businessId,
      bundleId: bundle._id,
    });

    return res.status(201).json(bundle);
  } catch (error) {
    logger.error("Error creating bundle", { error });
    next(error);
  }
};

/**
 * Get all bundles for a business
 * @route GET /api/businesses/:businessId/bundles
 */
export const getBusinessBundles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    // Build query
    const query: any = { businessId };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get bundles with pagination
    const bundles = await Bundle.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("products.productId", "name originalPrice discountedPrice");

    // Get total count for pagination
    const total = await Bundle.countDocuments(query);

    return res.status(200).json({
      bundles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error("Error getting business bundles", { error });
    next(error);
  }
};

/**
 * Get a single bundle by ID
 * @route GET /api/bundles/:bundleId
 */
export const getBundleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bundleId } = req.params;

    const bundle = await Bundle.findById(bundleId)
      .populate(
        "products.productId",
        "name originalPrice discountedPrice images"
      )
      .populate("businessId", "name type");

    if (!bundle) {
      return res.status(404).json({ message: "Bundle not found" });
    }

    return res.status(200).json(bundle);
  } catch (error) {
    logger.error("Error getting bundle by ID", { error });
    next(error);
  }
};

/**
 * Update a bundle
 * @route PUT /api/bundles/:bundleId
 */
export const updateBundle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bundleId } = req.params;
    const updates = req.body;

    // Find bundle
    const bundle = await Bundle.findById(bundleId);
    if (!bundle) {
      return res.status(404).json({ message: "Bundle not found" });
    }

    // Check if user has permission to update this bundle
    const business = await Business.findById(bundle.businessId);
    if (!business || business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to update this bundle",
      });
    }

    // Validate products if provided
    if (updates.products && updates.products.length > 0) {
      const productIds = updates.products.map((p: any) => p.productId);
      const products = await Product.find({
        _id: { $in: productIds },
        businessId: bundle.businessId,
      });

      if (products.length !== productIds.length) {
        return res.status(400).json({
          message:
            "One or more products are invalid or don't belong to this business",
        });
      }

      // Check if all products have enough quantity
      if (updates.totalQuantity) {
        for (const bundleProduct of updates.products) {
          const product = products.find(
            (p) => p._id.toString() === bundleProduct.productId
          );
          if (!product) continue; // Already checked above

          if (
            product.quantityRemaining <
            bundleProduct.quantity * updates.totalQuantity
          ) {
            return res.status(400).json({
              message: `Not enough quantity available for product ${product.name}`,
            });
          }
        }
      }
    }

    // Handle quantity updates
    if (updates.totalQuantity !== undefined) {
      // Calculate the difference between new and old quantity
      const quantityDiff = updates.totalQuantity - bundle.totalQuantity;

      // Update quantityRemaining proportionally
      updates.quantityRemaining = Math.max(
        0,
        bundle.quantityRemaining + quantityDiff
      );
    }

    // Update bundle
    const updatedBundle = await Bundle.findByIdAndUpdate(
      bundleId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("products.productId", "name originalPrice discountedPrice");

    if (!updatedBundle) {
      return res.status(404).json({ message: "Bundle not found" });
    }

    // Publish event to Kafka
    await produceMessage(config.bundleUpdatedTopic, {
      bundleId: updatedBundle._id.toString(),
      businessId: updatedBundle.businessId.toString(),
      name: updatedBundle.name,
      originalPrice: updatedBundle.originalPrice,
      discountedPrice: updatedBundle.discountedPrice,
      products: updatedBundle.products,
      totalQuantity: updatedBundle.totalQuantity,
      quantityRemaining: updatedBundle.quantityRemaining,
      expiryDate: updatedBundle.expiryDate,
      pickupWindow: updatedBundle.pickupWindow,
      status: updatedBundle.status,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Bundle updated: ${bundleId}`, { bundleId });

    return res.status(200).json(updatedBundle);
  } catch (error) {
    logger.error("Error updating bundle", { error });
    next(error);
  }
};

/**
 * Delete a bundle
 * @route DELETE /api/bundles/:bundleId
 */
export const deleteBundle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bundleId } = req.params;

    // Find bundle
    const bundle = await Bundle.findById(bundleId);
    if (!bundle) {
      return res.status(404).json({ message: "Bundle not found" });
    }

    // Check if user has permission to delete this bundle
    const business = await Business.findById(bundle.businessId);
    if (!business || business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to delete this bundle",
      });
    }

    // Delete bundle
    await Bundle.findByIdAndDelete(bundleId);

    // Publish event to Kafka
    await produceMessage(config.bundleDeletedTopic || "bundle-deleted", {
      bundleId: bundle._id.toString(),
      businessId: bundle.businessId.toString(),
      timestamp: new Date().toISOString(),
    });

    logger.info(`Bundle deleted: ${bundleId}`, { bundleId });

    return res.status(200).json({ message: "Bundle deleted successfully" });
  } catch (error) {
    logger.error("Error deleting bundle", { error });
    next(error);
  }
};

/**
 * Update bundle status
 * @route PATCH /api/bundles/:bundleId/status
 */
export const updateBundleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bundleId } = req.params;
    const { status } = req.body;

    if (!Object.values(ProductStatus).includes(status as ProductStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find bundle
    const bundle = await Bundle.findById(bundleId);
    if (!bundle) {
      return res.status(404).json({ message: "Bundle not found" });
    }

    // Check if user has permission to update this bundle
    const business = await Business.findById(bundle.businessId);
    if (!business || business.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You don't have permission to update this bundle",
      });
    }

    // Update status
    bundle.status = status as ProductStatus;
    await bundle.save();

    // Publish event to Kafka
    await produceMessage(config.bundleUpdatedTopic, {
      bundleId: bundle._id.toString(),
      businessId: bundle.businessId.toString(),
      status: bundle.status,
      timestamp: new Date().toISOString(),
    });

    logger.info(`Bundle status updated: ${bundleId}`, {
      bundleId,
      status,
    });

    return res.status(200).json({
      message: "Bundle status updated successfully",
      bundle,
    });
  } catch (error) {
    logger.error("Error updating bundle status", { error });
    next(error);
  }
};
