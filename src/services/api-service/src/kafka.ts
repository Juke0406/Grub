import { Kafka, Producer, Consumer, logLevel } from "kafkajs";
import config from "./config";
import { logger } from "./utils/logger";

// Create Kafka instance
const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: config.kafkaBrokers,
  logLevel: logLevel.ERROR,
});

// Create producer instance
let producer: Producer;

// Create consumer instance
let consumer: Consumer;

/**
 * Initialize Kafka producer
 */
export const initializeKafkaProducer = async (): Promise<void> => {
  try {
    producer = kafka.producer();
    await producer.connect();
    logger.info("Kafka producer connected successfully");
  } catch (error) {
    logger.error(`Error connecting to Kafka producer: ${error}`);
    throw error;
  }
};

/**
 * Initialize Kafka consumer
 */
export const initializeKafkaConsumer = async (): Promise<void> => {
  try {
    consumer = kafka.consumer({ groupId: config.kafkaGroupId });
    await consumer.connect();
    logger.info("Kafka consumer connected successfully");

    // Subscribe to topics
    await consumer.subscribe({
      topics: [
        // Add topics to subscribe to
      ],
      fromBeginning: false,
    });

    // Set up message handler
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) return;

          const value = JSON.parse(message.value.toString());
          logger.info(
            `Received message from topic ${topic}: ${JSON.stringify(value)}`
          );

          // Handle messages based on topic
          switch (topic) {
            // Add topic handlers here
            default:
              logger.warn(`No handler for topic: ${topic}`);
          }
        } catch (error) {
          logger.error(`Error processing Kafka message: ${error}`);
        }
      },
    });
  } catch (error) {
    logger.error(`Error connecting to Kafka consumer: ${error}`);
    throw error;
  }
};

/**
 * Send message to Kafka topic
 */
export const sendMessage = async (
  topic: string,
  message: any
): Promise<void> => {
  try {
    if (!producer) {
      throw new Error("Kafka producer not initialized");
    }

    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });

    logger.info(`Message sent to topic ${topic}: ${JSON.stringify(message)}`);
  } catch (error) {
    logger.error(`Error sending message to Kafka: ${error}`);
    throw error;
  }
};

/**
 * Disconnect Kafka producer and consumer
 */
export const disconnectKafka = async (): Promise<void> => {
  try {
    if (producer) {
      await producer.disconnect();
      logger.info("Kafka producer disconnected");
    }

    if (consumer) {
      await consumer.disconnect();
      logger.info("Kafka consumer disconnected");
    }
  } catch (error) {
    logger.error(`Error disconnecting from Kafka: ${error}`);
    throw error;
  }
};

// Send API key created event
export const sendApiKeyCreatedEvent = async (apiKey: any): Promise<void> => {
  await sendMessage(config.apiKeyCreatedTopic, {
    event: "API_KEY_CREATED",
    data: apiKey,
    timestamp: new Date().toISOString(),
  });
};

// Send API key deleted event
export const sendApiKeyDeletedEvent = async (
  apiKeyId: string
): Promise<void> => {
  await sendMessage(config.apiKeyDeletedTopic, {
    event: "API_KEY_DELETED",
    data: { id: apiKeyId },
    timestamp: new Date().toISOString(),
  });
};

// Send API key updated event
export const sendApiKeyUpdatedEvent = async (apiKey: any): Promise<void> => {
  await sendMessage(config.apiKeyUpdatedTopic, {
    event: "API_KEY_UPDATED",
    data: apiKey,
    timestamp: new Date().toISOString(),
  });
};
