import { Router } from "express";
import * as productController from "../controllers/product.controller";
import * as categoryController from "../controllers/category.controller";
import * as bundleController from "../controllers/bundle.controller";
import { validateRequest } from "../middleware/validation.middleware";
import {
  authenticate,
  isBusinessOwner,
  isAdmin,
} from "../middleware/auth.middleware";
import {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  createBundleSchema,
  updateBundleSchema,
  listProductsQuerySchema,
} from "../validators/listing.validator";

const router = Router();

// Product routes
router.get(
  "/products",
  validateRequest(listProductsQuerySchema, "query"),
  productController.getProducts
);

router.get("/products/:id", productController.getProductById);

router.post(
  "/products",
  authenticate,
  isBusinessOwner,
  validateRequest(createProductSchema),
  productController.createProduct
);

router.put(
  "/products/:id",
  authenticate,
  isBusinessOwner,
  validateRequest(updateProductSchema),
  productController.updateProduct
);

router.patch(
  "/products/:id/quantity",
  authenticate,
  isBusinessOwner,
  productController.updateProductQuantity
);

router.delete(
  "/products/:id",
  authenticate,
  isBusinessOwner,
  productController.deleteProduct
);

// Category routes
router.get("/categories", categoryController.getCategories);

router.get("/categories/:id", categoryController.getCategoryById);

router.post(
  "/categories",
  authenticate,
  isBusinessOwner,
  validateRequest(createCategorySchema),
  categoryController.createCategory
);

router.put(
  "/categories/:id",
  authenticate,
  validateRequest(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  "/categories/:id",
  authenticate,
  categoryController.deleteCategory
);

// Bundle routes
router.get("/bundles", bundleController.getBundles);

router.get("/bundles/:id", bundleController.getBundleById);

router.post(
  "/bundles",
  authenticate,
  isBusinessOwner,
  validateRequest(createBundleSchema),
  bundleController.createBundle
);

router.put(
  "/bundles/:id",
  authenticate,
  isBusinessOwner,
  validateRequest(updateBundleSchema),
  bundleController.updateBundle
);

router.patch(
  "/bundles/:id/quantity",
  authenticate,
  isBusinessOwner,
  bundleController.updateBundleQuantity
);

router.delete(
  "/bundles/:id",
  authenticate,
  isBusinessOwner,
  bundleController.deleteBundle
);

// Admin routes
router.post(
  "/admin/categories",
  authenticate,
  isAdmin,
  validateRequest(createCategorySchema),
  categoryController.createCategory
);

export default router;
