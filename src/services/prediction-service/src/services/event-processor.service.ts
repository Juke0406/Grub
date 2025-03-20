import { Consumer } from "kafkajs";
import { logger } from "../utils/logger";
import { config } from "../config";
import { createConsumer } from "../kafka";
import { ProductDemand } from "../models/product-demand.model";
import { triggerScheduledPrediction } from "../controllers/prediction.controller";
import { PredictionType } from "../models/prediction.model";

/**
 * Service to process Kafka events
 */
export class EventProcessorService {
  private consumer: Consumer | null = null;

  /**
   * Initialize the event processor
   */
  async initialize(): Promise<void> {
    try {
      // Create Kafka consumer
      this.consumer = await createConsumer(config.kafkaGroupId, [
        config.reservationCreatedTopic,
        config.reservationUpdatedTopic,
        config.reservationCancelledTopic,
        config.productCreatedTopic,
        config.productUpdatedTopic,
        config.productDeletedTopic,
      ]);

      // Set up message handler
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            if (!message.value) {
              logger.warn("Received empty message", { topic, partition });
              return;
            }

            const eventData = JSON.parse(message.value.toString());
            logger.debug(`Processing event from topic ${topic}`, { eventData });

            // Process event based on topic
            switch (topic) {
              case config.reservationCreatedTopic:
                await this.handleReservationCreated(eventData);
                break;
              case config.reservationUpdatedTopic:
                await this.handleReservationUpdated(eventData);
                break;
              case config.reservationCancelledTopic:
                await this.handleReservationCancelled(eventData);
                break;
              case config.productCreatedTopic:
                await this.handleProductCreated(eventData);
                break;
              case config.productUpdatedTopic:
                await this.handleProductUpdated(eventData);
                break;
              case config.productDeletedTopic:
                await this.handleProductDeleted(eventData);
                break;
              default:
                logger.warn(`Unhandled topic: ${topic}`);
            }
          } catch (error) {
            logger.error(
              `Error processing message from topic ${topic}:`,
              error
            );
          }
        },
      });

      logger.info("Event processor initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize event processor:", error);
      throw error;
    }
  }

  /**
   * Handle reservation created event
   */
  private async handleReservationCreated(eventData: any): Promise<void> {
    try {
      const { businessId, products, createdAt } = eventData.data;
      const reservationDate = new Date(createdAt);

      // Update product demand for each product in the reservation
      for (const product of products) {
        const { productId, quantity } = product;

        // Find or create product demand record for this date
        const dateKey = new Date(reservationDate);
        dateKey.setHours(0, 0, 0, 0); // Normalize to start of day

        let productDemand = await ProductDemand.findOne({
          productId,
          businessId,
          date: dateKey,
        });

        if (!productDemand) {
          // Create new product demand record
          productDemand = new ProductDemand({
            productId,
            businessId,
            date: dateKey,
            quantity: 0,
            reservationCount: 0,
            salesCount: 0,
            wastageCount: 0,
          });
        }

        // Update reservation count
        productDemand.reservationCount += quantity;

        // Save changes
        await productDemand.save();
        logger.debug(`Updated product demand for reservation created`, {
          productId,
          businessId,
          date: dateKey,
          reservationCount: productDemand.reservationCount,
        });
      }
    } catch (error) {
      logger.error("Error handling reservation created event:", error);
    }
  }

  /**
   * Handle reservation updated event
   */
  private async handleReservationUpdated(eventData: any): Promise<void> {
    try {
      const { businessId, products, previousProducts, updatedAt } =
        eventData.data;
      const reservationDate = new Date(updatedAt);
      const dateKey = new Date(reservationDate);
      dateKey.setHours(0, 0, 0, 0); // Normalize to start of day

      // Process removed or reduced quantity products
      for (const prevProduct of previousProducts || []) {
        const { productId, quantity: prevQuantity } = prevProduct;

        // Find current product
        const currentProduct = products.find(
          (p: any) => p.productId === productId
        );
        const currentQuantity = currentProduct ? currentProduct.quantity : 0;

        // If quantity reduced, update product demand
        if (currentQuantity < prevQuantity) {
          const quantityDiff = prevQuantity - currentQuantity;

          const productDemand = await ProductDemand.findOne({
            productId,
            businessId,
            date: dateKey,
          });

          if (productDemand) {
            productDemand.reservationCount = Math.max(
              0,
              productDemand.reservationCount - quantityDiff
            );
            await productDemand.save();

            logger.debug(`Reduced product demand for reservation update`, {
              productId,
              businessId,
              date: dateKey,
              quantityDiff,
              newReservationCount: productDemand.reservationCount,
            });
          }
        }
      }

      // Process new or increased quantity products
      for (const product of products) {
        const { productId, quantity } = product;

        // Find previous product
        const prevProduct = (previousProducts || []).find(
          (p: any) => p.productId === productId
        );
        const prevQuantity = prevProduct ? prevProduct.quantity : 0;

        // If new product or quantity increased, update product demand
        if (quantity > prevQuantity) {
          const quantityDiff = quantity - prevQuantity;

          let productDemand = await ProductDemand.findOne({
            productId,
            businessId,
            date: dateKey,
          });

          if (!productDemand) {
            productDemand = new ProductDemand({
              productId,
              businessId,
              date: dateKey,
              quantity: 0,
              reservationCount: 0,
              salesCount: 0,
              wastageCount: 0,
            });
          }

          productDemand.reservationCount += quantityDiff;
          await productDemand.save();

          logger.debug(`Increased product demand for reservation update`, {
            productId,
            businessId,
            date: dateKey,
            quantityDiff,
            newReservationCount: productDemand.reservationCount,
          });
        }
      }
    } catch (error) {
      logger.error("Error handling reservation updated event:", error);
    }
  }

  /**
   * Handle reservation cancelled event
   */
  private async handleReservationCancelled(eventData: any): Promise<void> {
    try {
      const { businessId, products, cancelledAt } = eventData.data;
      const reservationDate = new Date(cancelledAt);
      const dateKey = new Date(reservationDate);
      dateKey.setHours(0, 0, 0, 0); // Normalize to start of day

      // Update product demand for each product in the cancelled reservation
      for (const product of products) {
        const { productId, quantity } = product;

        const productDemand = await ProductDemand.findOne({
          productId,
          businessId,
          date: dateKey,
        });

        if (productDemand) {
          // Reduce reservation count
          productDemand.reservationCount = Math.max(
            0,
            productDemand.reservationCount - quantity
          );

          // Save changes
          await productDemand.save();
          logger.debug(`Updated product demand for reservation cancelled`, {
            productId,
            businessId,
            date: dateKey,
            reservationCount: productDemand.reservationCount,
          });
        }
      }
    } catch (error) {
      logger.error("Error handling reservation cancelled event:", error);
    }
  }

  /**
   * Handle product created event
   */
  private async handleProductCreated(eventData: any): Promise<void> {
    // No specific action needed for prediction service when a product is created
    logger.debug("Product created event received", {
      productId: eventData.data.id,
    });
  }

  /**
   * Handle product updated event
   */
  private async handleProductUpdated(eventData: any): Promise<void> {
    // No specific action needed for prediction service when a product is updated
    logger.debug("Product updated event received", {
      productId: eventData.data.id,
    });
  }

  /**
   * Handle product deleted event
   */
  private async handleProductDeleted(eventData: any): Promise<void> {
    // No specific action needed for prediction service when a product is deleted
    logger.debug("Product deleted event received", {
      productId: eventData.data.id,
    });
  }

  /**
   * Trigger daily predictions for all businesses
   */
  async triggerDailyPredictions(businessIds: string[]): Promise<void> {
    try {
      await triggerScheduledPrediction(PredictionType.DAILY, businessIds);
    } catch (error) {
      logger.error("Failed to trigger daily predictions:", error);
    }
  }

  /**
   * Trigger weekly predictions for all businesses
   */
  async triggerWeeklyPredictions(businessIds: string[]): Promise<void> {
    try {
      await triggerScheduledPrediction(PredictionType.WEEKLY, businessIds);
    } catch (error) {
      logger.error("Failed to trigger weekly predictions:", error);
    }
  }

  /**
   * Shutdown the event processor
   */
  async shutdown(): Promise<void> {
    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        logger.info("Event processor consumer disconnected");
      }
    } catch (error) {
      logger.error("Error shutting down event processor:", error);
    }
  }
}
