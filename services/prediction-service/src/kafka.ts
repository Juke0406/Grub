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
 * Publish prediction generated event
 */
export const publishPredictionGenerated = async (
  predictionData: any
): Promise<void> => {
  await sendMessage(config.predictionGeneratedTopic, {
    event: "PREDICTION_GENERATED",
    data: predictionData,
    timestamp: new Date().toISOString(),
  });
};
