import { Request, Response } from "express";
import mongoose from "mongoose";
import Category from "../models/category.model";
import { ApiError } from "../middleware/error.middleware";
import { logger } from "../utils/logger";
import { publishCategoryCreated, publishCategoryUpdated } from "../kafka";

/**
 * Create a new category
 */
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { businessId } = req.user!;

    // Create category with business ID from authenticated user
    // If isGlobal is true, only admins can create it
    if (req.body.isGlobal && req.user!.role !== "admin") {
      throw new ApiError(403, "Only admins can create global categories");
    }

    const categoryData = {
      ...req.body,
      businessId: req.body.isGlobal ? undefined : businessId,
    };

    // Check if parent category exists if provided
    if (categoryData.parentCategory) {
      const parentCategory = await Category.findById(
        categoryData.parentCategory
      );
      if (!parentCategory) {
        throw new ApiError(400, "Parent category does not exist");
      }
    }

    const category = new Category(categoryData);
    await category.save();

    // Publish category created event
    await publishCategoryCreated(category.toJSON());

    res.status(201).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }
};

/**
 * Get all categories with filtering
 */
export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { businessId, isGlobal, parentCategory } = req.query;

    // Build filter object
    const filter: any = {};

    // Business filter
    if (businessId) {
      filter.businessId = businessId;
    }

    // Global filter
    if (isGlobal !== undefined) {
      filter.isGlobal = isGlobal === "true";
    }

    // Parent category filter
    if (parentCategory) {
      if (parentCategory === "null") {
        // Find root categories (no parent)
        filter.parentCategory = { $exists: false };
      } else {
        filter.parentCategory = parentCategory;
      }
    }

    // Execute query
    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    logger.error("Error fetching categories:", error);
    throw error;
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid category ID");
    }
    throw error;
  }
};

/**
 * Update a category
 */
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { businessId } = req.user!;

    // Find category
    const category = await Category.findById(id);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    // Check permissions
    if (
      (category.isGlobal && req.user!.role !== "admin") ||
      (!category.isGlobal &&
        category.businessId &&
        category.businessId.toString() !== businessId &&
        req.user!.role !== "admin")
    ) {
      throw new ApiError(
        403,
        "You don't have permission to update this category"
      );
    }

    // Check if parent category exists if provided
    if (req.body.parentCategory) {
      const parentCategory = await Category.findById(req.body.parentCategory);
      if (!parentCategory) {
        throw new ApiError(400, "Parent category does not exist");
      }

      // Prevent circular references
      if (req.body.parentCategory === id) {
        throw new ApiError(400, "Category cannot be its own parent");
      }
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    // Publish category updated event
    await publishCategoryUpdated(updatedCategory!.toJSON());

    res.status(200).json({
      status: "success",
      data: updatedCategory,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new ApiError(400, error.message);
    } else if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid category ID");
    }
    throw error;
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { businessId } = req.user!;

    // Find category
    const category = await Category.findById(id);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    // Check permissions
    if (
      (category.isGlobal && req.user!.role !== "admin") ||
      (!category.isGlobal &&
        category.businessId &&
        category.businessId.toString() !== businessId &&
        req.user!.role !== "admin")
    ) {
      throw new ApiError(
        403,
        "You don't have permission to delete this category"
      );
    }

    // Check if category has children
    const hasChildren = await Category.exists({ parentCategory: id });
    if (hasChildren) {
      throw new ApiError(400, "Cannot delete category with subcategories");
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw new ApiError(400, "Invalid category ID");
    }
    throw error;
  }
};
