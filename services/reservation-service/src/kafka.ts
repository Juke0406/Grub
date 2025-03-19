import { Kafka, Producer, Consumer, logLevel } from "kafkajs";
import { config } from "./config";
import { logger } from "./utils/logger";
import {
  handleUserCreatedEvent,
  handleUserUpdatedEvent,
} from "./handlers/user.handler";
import { handleProductCreatedEvent } from "./handlers/product.handler";

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
 * Setup Kafka consumer
 */
export const setupKafkaConsumer = async (): Promise<void> => {
  try {
    const consumer = kafka.consumer({ groupId: config.kafkaGroupId });
    await consumer.connect();

    // Subscribe to topics
    await consumer.subscribe({ topic: config.userCreatedTopic });
    await consumer.subscribe({ topic: config.userUpdatedTopic });
    await consumer.subscribe({ topic: config.productCreatedTopic });

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) {
            logger.warn("Received message with no value");
            return;
          }

          const data = JSON.parse(message.value.toString());
          logger.debug(`Received message from topic ${topic}`, { data });

          // Handle different events based on topic
          switch (topic) {
            case config.userCreatedTopic:
              await handleUserCreatedEvent(data);
              break;
            case config.userUpdatedTopic:
              await handleUserUpdatedEvent(data);
              break;
            case config.productCreatedTopic:
              await handleProductCreatedEvent(data);
              break;
            default:
              logger.warn(`No handler for topic ${topic}`);
          }
        } catch (error) {
          logger.error(`Error processing message from topic ${topic}:`, error);
        }
      },
    });

    logger.info("Kafka consumer started");
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
 * Publish reservation created event
 */
export const publishReservationCreated = async (
  reservationData: any
): Promise<void> => {
  await sendMessage(config.reservationCreatedTopic, {
    event: "RESERVATION_CREATED",
    data: reservationData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish reservation updated event
 */
export const publishReservationUpdated = async (
  reservationData: any
): Promise<void> => {
  await sendMessage(config.reservationUpdatedTopic, {
    event: "RESERVATION_UPDATED",
    data: reservationData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish reservation cancelled event
 */
export const publishReservationCancelled = async (
  reservationData: any
): Promise<void> => {
  await sendMessage(config.reservationCancelledTopic, {
    event: "RESERVATION_CANCELLED",
    data: reservationData,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Publish product updated event (for inventory updates)
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
