import { Kafka, Producer, Consumer, logLevel } from "kafkajs";
import { config } from "./config";
import { logger } from "./utils/logger";

// Initialize Kafka client
const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: config.kafkaBrokers,
  logLevel: logLevel.ERROR,
});

// Initialize producer
let producer: Producer;

/**
 * Setup Kafka producer
 */
export const setupKafkaProducer = async (): Promise<void> => {
  try {
    producer = kafka.producer();
    await producer.connect();
    logger.info("Kafka producer connected");
  } catch (error) {
    logger.error("Failed to connect Kafka producer:", error);
    throw error;
  }
};

/**
 * Get Kafka producer instance
 */
export const getKafkaProducer = (): Producer => {
  if (!producer) {
    throw new Error("Kafka producer not initialized");
  }
  return producer;
};

/**
 * Send message to Kafka topic
 */
export const sendMessage = async (
  topic: string,
  message: any
): Promise<void> => {
  try {
    await getKafkaProducer().send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    logger.debug(`Message sent to topic ${topic}`, { message });
  } catch (error) {
    logger.error(`Failed to send message to topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Create a Kafka consumer
 */
export const createConsumer = async (
  groupId: string,
  topics: string[]
): Promise<Consumer> => {
  try {
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();

    // Subscribe to topics
    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    logger.info(
      `Kafka consumer connected and subscribed to topics: ${topics.join(", ")}`
    );
    return consumer;
  } catch (error) {
    logger.error("Failed to create Kafka consumer:", error);
    throw error;
  }
};

/**
 * Setup Kafka consumer for the listing service
 */
export const setupKafkaConsumer = async (): Promise<void> => {
  try {
    const consumer = await createConsumer(config.kafkaGroupId, [
      // Subscribe to relevant topics
      config.productCreatedTopic,
      config.productUpdatedTopic,
      config.productDeletedTopic,
      config.categoryCreatedTopic,
      config.categoryUpdatedTopic,
      config.bundleCreatedTopic,
      config.bundleUpdatedTopic,
    ]);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) return;

          const data = JSON.parse(message.value.toString());
          logger.debug(`Received message from topic ${topic}`, { data });

          // Handle different events based on topic
          switch (topic) {
            case config.productCreatedTopic:
              // Handle product created event
              logger.info(`Product created: ${data.data.name}`);
              break;
            case config.productUpdatedTopic:
              // Handle product updated event
              logger.info(`Product updated: ${data.data.name}`);
              break;
            case config.productDeletedTopic:
              // Handle product deleted event
              logger.info(`Product deleted: ${data.data.id}`);
              break;
            case config.categoryCreatedTopic:
              // Handle category created event
              logger.info(`Category created: ${data.data.name}`);
              break;
            case config.categoryUpdatedTopic:
              // Handle category updated event
              logger.info(`Category updated: ${data.data.name}`);
              break;
            case config.bundleCreatedTopic:
              // Handle bundle created event
              logger.info(`Bundle created: ${data.data.name}`);
              break;
            case config.bundleUpdatedTopic:
              // Handle bundle updated event
              logger.info(`Bundle updated: ${data.data.name}`);
              break;
            default:
              logger.warn(`No handler for topic: ${topic}`);
          }
        } catch (error) {
          logger.error(`Error processing message from topic ${topic}:`, error);
        }
      },
    });

    logger.info("Kafka consumer is running");
  } catch (error) {
    logger.error("Failed to setup Kafka consumer:", error);
    throw error;
  }
};

/**
 * Disconnect Kafka producer
 */
export const disconnectKafkaProducer = async (): Promise<void> => {
  try {
    if (producer) {
      await producer.disconnect();
      logger.info("Kafka producer disconnected");
    }
  } catch (error) {
    logger.error("Error disconnecting Kafka producer:", error);
    throw error;
  }
};

/**
 * Publish product created event
 */
export const publishProductCreated = async (
  productData: any
): Promise<void> => {
  await sendMessage(config.productCreatedTopic, {
    event: "PRODUCT_CREATED",
    data: productData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish product updated event
 */
export const publishProductUpdated = async (
  productData: any
): Promise<void> => {
  await sendMessage(config.productUpdatedTopic, {
    event: "PRODUCT_UPDATED",
    data: productData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish product deleted event
 */
export const publishProductDeleted = async (
  productId: string
): Promise<void> => {
  await sendMessage(config.productDeletedTopic, {
    event: "PRODUCT_DELETED",
    data: { id: productId },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish category created event
 */
export const publishCategoryCreated = async (
  categoryData: any
): Promise<void> => {
  await sendMessage(config.categoryCreatedTopic, {
    event: "CATEGORY_CREATED",
    data: categoryData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish category updated event
 */
export const publishCategoryUpdated = async (
  categoryData: any
): Promise<void> => {
  await sendMessage(config.categoryUpdatedTopic, {
    event: "CATEGORY_UPDATED",
    data: categoryData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish bundle created event
 */
export const publishBundleCreated = async (bundleData: any): Promise<void> => {
  await sendMessage(config.bundleCreatedTopic, {
    event: "BUNDLE_CREATED",
    data: bundleData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish bundle updated event
 */
export const publishBundleUpdated = async (bundleData: any): Promise<void> => {
  await sendMessage(config.bundleUpdatedTopic, {
    event: "BUNDLE_UPDATED",
    data: bundleData,
    timestamp: new Date().toISOString(),
  });
};
