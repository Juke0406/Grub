import { Router } from "express";
import * as productController from "../controllers/product.controller";
import * as bundleController from "../controllers/bundle.controller";
import * as categoryController from "../controllers/category.controller";
import * as businessController from "../controllers/business.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validationMiddleware } from "../middleware/validation.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";
import {
  validateBusinessId,
  validateCategoryId,
  validateProductId,
  validateBundleId,
  validatePagination,
  validateCategory,
  validateProduct,
  validateBundle,
  validateBusiness,
  validateImageUpload,
} from "../validators/creation.validator";

const router = Router();

// Business routes
router.post(
  "/businesses",
  authMiddleware,
  validationMiddleware(validateBusiness),
  businessController.createBusiness
);

router.get(
  "/businesses/:businessId",
  validateBusinessId,
  businessController.getBusinessById
);

router.put(
  "/businesses/:businessId",
  authMiddleware,
  validateBusinessId,
  validationMiddleware(validateBusiness),
  businessController.updateBusiness
);

router.delete(
  "/businesses/:businessId",
  authMiddleware,
  validateBusinessId,
  businessController.deleteBusiness
);

// Category routes
router.post(
  "/businesses/:businessId/categories",
  authMiddleware,
  validateBusinessId,
  validationMiddleware(validateCategory),
  categoryController.createCategory
);

router.get(
  "/businesses/:businessId/categories",
  validateBusinessId,
  validationMiddleware(validatePagination),
  categoryController.getBusinessCategories
);

router.get(
  "/categories/:categoryId",
  validateCategoryId,
  categoryController.getCategoryById
);

router.put(
  "/categories/:categoryId",
  authMiddleware,
  validateCategoryId,
  validationMiddleware(validateCategory),
  categoryController.updateCategory
);

router.delete(
  "/categories/:categoryId",
  authMiddleware,
  validateCategoryId,
  categoryController.deleteCategory
);

// Product routes
router.post(
  "/businesses/:businessId/products",
  authMiddleware,
  validateBusinessId,
  validationMiddleware(validateProduct),
  productController.createProduct
);

router.get(
  "/businesses/:businessId/products",
  validateBusinessId,
  validationMiddleware(validatePagination),
  productController.getBusinessProducts
);

router.get(
  "/products/:productId",
  validateProductId,
  productController.getProductById
);

router.put(
  "/products/:productId",
  authMiddleware,
  validateProductId,
  validationMiddleware(validateProduct),
  productController.updateProduct
);

router.delete(
  "/products/:productId",
  authMiddleware,
  validateProductId,
  productController.deleteProduct
);

router.patch(
  "/products/:productId/status",
  authMiddleware,
  validateProductId,
  productController.updateProductStatus
);

// Bundle routes
router.post(
  "/businesses/:businessId/bundles",
  authMiddleware,
  validateBusinessId,
  validationMiddleware(validateBundle),
  bundleController.createBundle
);

router.get(
  "/businesses/:businessId/bundles",
  validateBusinessId,
  validationMiddleware(validatePagination),
  bundleController.getBusinessBundles
);

router.get(
  "/bundles/:bundleId",
  validateBundleId,
  bundleController.getBundleById
);

router.put(
  "/bundles/:bundleId",
  authMiddleware,
  validateBundleId,
  validationMiddleware(validateBundle),
  bundleController.updateBundle
);

router.delete(
  "/bundles/:bundleId",
  authMiddleware,
  validateBundleId,
  bundleController.deleteBundle
);

router.patch(
  "/bundles/:bundleId/status",
  authMiddleware,
  validateBundleId,
  bundleController.updateBundleStatus
);

// Image upload routes
router.post(
  "/upload",
  authMiddleware,
  uploadMiddleware.single("image"),
  validationMiddleware(validateImageUpload),
  businessController.uploadImage
);

export default router;
