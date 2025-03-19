import { Product } from "../models/product.model";
import { logger } from "../utils/logger";

/**
 * Handle product created event from Kafka
 * Creates a new product in the reservation service database
 */
export const handleProductCreatedEvent = async (data: any): Promise<void> => {
  try {
    const {
      SKU,
      imageUrl,
      name,
      description,
      originalPrice,
      discountedPrice,
      category,
      userID,
      inventory,
    } = data.data;

    logger.info(`Processing product created event for SKU ${SKU}`);

    // Check if product already exists
    const existingProduct = await Product.findOne({ SKU });
    if (existingProduct) {
      logger.warn(
        `Product with SKU ${SKU} already exists, updating instead of creating`
      );

      // Update existing product
      existingProduct.imageUrl = imageUrl;
      existingProduct.name = name;
      existingProduct.description = description;
      existingProduct.originalPrice = originalPrice;
      existingProduct.discountedPrice = discountedPrice;
      existingProduct.category = category;
      existingProduct.userID = userID;
      existingProduct.inventory = inventory;

      await existingProduct.save();
      logger.info(`Product with SKU ${SKU} updated successfully`);
      return;
    }

    // Create new product
    const product = new Product({
      SKU,
      imageUrl,
      name,
      description,
      originalPrice,
      discountedPrice,
      category,
      userID,
      inventory,
    });

    await product.save();
    logger.info(`Product with SKU ${SKU} created successfully`);
  } catch (error) {
    logger.error("Error handling product created event:", error);
    throw error;
  }
};

/**
 * Handle product updated event from Kafka
 * Updates an existing product in the reservation service database
 */
export const handleProductUpdatedEvent = async (data: any): Promise<void> => {
  try {
    const {
      SKU,
      imageUrl,
      name,
      description,
      originalPrice,
      discountedPrice,
      category,
      userID,
      inventory,
    } = data.data;

    logger.info(`Processing product updated event for SKU ${SKU}`);

    // Check if product exists
    const product = await Product.findOne({ SKU });
    if (!product) {
      logger.warn(
        `Product with SKU ${SKU} not found, creating instead of updating`
      );
      await handleProductCreatedEvent(data);
      return;
    }

    // Update product fields
    if (imageUrl) product.imageUrl = imageUrl;
    if (name) product.name = name;
    if (description) product.description = description;
    if (originalPrice !== undefined) product.originalPrice = originalPrice;
    if (discountedPrice !== undefined)
      product.discountedPrice = discountedPrice;
    if (category) product.category = category;
    if (userID) product.userID = userID;

    // Update inventory if provided
    if (inventory) {
      if (inventory.quantity !== undefined)
        product.inventory.quantity = inventory.quantity;
      if (inventory.expirationDate)
        product.inventory.expirationDate = inventory.expirationDate;
    }

    await product.save();
    logger.info(`Product with SKU ${SKU} updated successfully`);
  } catch (error) {
    logger.error("Error handling product updated event:", error);
    throw error;
  }
};

/**
 * Update product inventory
 * Used when a reservation is created or cancelled
 */
export const updateProductInventory = async (
  productId: string,
  quantityChange: number
): Promise<boolean> => {
  try {
    logger.info(
      `Updating inventory for product ${productId} by ${quantityChange}`
    );

    const product = await Product.findOne({ SKU: productId });
    if (!product) {
      logger.warn(`Product with SKU ${productId} not found`);
      return false;
    }

    // Update quantity
    product.inventory.quantity += quantityChange;

    // Ensure quantity doesn't go below 0
    if (product.inventory.quantity < 0) {
      product.inventory.quantity = 0;
      logger.warn(
        `Inventory for product ${productId} would go below 0, setting to 0`
      );
    }

    await product.save();
    logger.info(
      `Inventory for product ${productId} updated successfully to ${product.inventory.quantity}`
    );
    return true;
  } catch (error) {
    logger.error(`Error updating inventory for product ${productId}:`, error);
    return false;
  }
};
