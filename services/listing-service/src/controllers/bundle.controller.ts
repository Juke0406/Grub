import { Request, Response } from "express";
import mongoose from "mongoose";
import Bundle from "../models/bundle.model";
import Product from "../models/product.model";
import { ApiError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { publishBundleCreated, publishBundleUpdated } from "../kafka";

/**
 * Create a new bundle
 */
export const createBundle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { businessId } = req.user!;

    // Create bundle with business ID from authenticated user
    const bundleData = {
      ...req.body,
      businessId,
      quantityRemaining: req.body.totalQuantity, // Initially, remaining quantity equals total quantity
    };

    // Validate products exist and belong to the business
    if (bundleData.products && bundleData.products.length > 0) {
      const productIds = bundleData.products.map((p: any) => p.productId);

      const products = await Product.find({
        _id: { $in: productIds },
        businessId,
      });

      if (products.length !== productIds.length) {
        throw new ApiError(
          400,
          "One or more products do not exist or don't belong to your business"
        );
      }
    }

    const bundle = new Bundle(bundleData);
    await bundle.save();

    // Publish bundle created event
    await publishBundleCreated(bundle.toJSON());

    res.status(201).json({
      status: "success",
      data: bundle,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }
};

/**
 * Get all bundles with filtering, sorting, and pagination
 */
export const getBundles = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "created_desc",
      status,
      businessId,
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
    }

    // Business filter
    if (businessId) {
      filter.businessId = businessId;
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
    const bundles = await Bundle.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate("products.productId", "name originalPrice discountedPrice");

    // Get total count for pagination
    const total = await Bundle.countDocuments(filter);

    res.status(200).json({
      status: "success",
      data: {
        bundles,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching bundles:", error);
    throw error;
  }
};

/**
 * Get a single bundle by ID
 */
export const getBundleById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const bundle = await Bundle.findById(id).populate(
      "products.productId",
      "name originalPrice discountedPrice images"
    );

    if (!bundle) {
      throw new ApiError(404, "Bundle not found");
    }

    res.status(200).json({
      status: "success",
      data: bundle,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid bundle ID");
    }
    throw error;
  }
};

/**
 * Update a bundle
 */
export const updateBundle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { businessId } = req.user!;

    // Find bundle and check ownership
    const bundle = await Bundle.findById(id);

    if (!bundle) {
      throw new ApiError(404, "Bundle not found");
    }

    // Check if user owns the bundle
    if (
      bundle.businessId.toString() !== businessId &&
      req.user!.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "You don't have permission to update this bundle"
      );
    }

    // Validate products exist and belong to the business if provided
    if (req.body.products && req.body.products.length > 0) {
      const productIds = req.body.products.map((p: any) => p.productId);

      const products = await Product.find({
        _id: { $in: productIds },
        businessId,
      });

      if (products.length !== productIds.length) {
        throw new ApiError(
          400,
          "One or more products do not exist or don't belong to your business"
        );
      }
    }

    // Update bundle
    const updatedBundle = await Bundle.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate(
      "products.productId",
      "name originalPrice discountedPrice images"
    );

    // Publish bundle updated event
    await publishBundleUpdated(updatedBundle!.toJSON());

    res.status(200).json({
      status: "success",
      data: updatedBundle,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new ApiError(400, error.message);
    } else if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid bundle ID");
    }
    throw error;
  }
};

/**
 * Delete a bundle
 */
export const deleteBundle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { businessId } = req.user!;

    // Find bundle and check ownership
    const bundle = await Bundle.findById(id);

    if (!bundle) {
      throw new ApiError(404, "Bundle not found");
    }

    // Check if user owns the bundle
    if (
      bundle.businessId.toString() !== businessId &&
      req.user!.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "You don't have permission to delete this bundle"
      );
    }

    // Delete bundle
    await Bundle.findByIdAndDelete(id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid bundle ID");
    }
    throw error;
  }
};

/**
 * Update bundle quantity
 */
export const updateBundleQuantity = async (
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

    // Find bundle and check ownership
    const bundle = await Bundle.findById(id);

    if (!bundle) {
      throw new ApiError(404, "Bundle not found");
    }

    // Check if user owns the bundle
    if (
      bundle.businessId.toString() !== businessId &&
      req.user!.role !== "admin"
    ) {
      throw new ApiError(
        403,
        "You don't have permission to update this bundle"
      );
    }

    // Update bundle quantity
    bundle.quantityRemaining = Math.min(quantity, bundle.totalQuantity);

    // Update status if needed
    if (bundle.quantityRemaining <= 0) {
      bundle.status = "sold_out";
    } else if (bundle.status === "sold_out") {
      bundle.status = "active";
    }

    await bundle.save();

    // Publish bundle updated event
    await publishBundleUpdated(bundle.toJSON());

    res.status(200).json({
      status: "success",
      data: bundle,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new ApiError(400, error.message);
    } else if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid bundle ID");
    }
    throw error;
  }
};
