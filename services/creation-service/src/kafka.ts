import { Kafka, Producer, Consumer, logLevel } from "kafkajs";
import { config } from "./config";
import { logger } from "./utils/logger";

// Create Kafka client
const kafka = new Kafka({
  clientId: config.kafkaClientId,
  brokers: config.kafkaBrokers,
  logLevel: logLevel.ERROR,
});

// Initialize producer
let producer: Producer | null = null;

// Initialize consumers map
const consumers: Map<string, Consumer> = new Map();

/**
 * Initialize Kafka producer
 */
export const initProducer = async (): Promise<void> => {
  try {
    producer = kafka.producer();
    await producer.connect();
    logger.info("Kafka producer connected");
  } catch (error) {
    logger.error("Failed to connect Kafka producer", { error });
    throw error;
  }
};

/**
 * Produce a message to a Kafka topic
 * @param topic Topic to send message to
 * @param message Message to send
 */
export const produceMessage = async (
  topic: string,
  message: any
): Promise<void> => {
  if (!producer) {
    await initProducer();
  }

  try {
    await producer!.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    logger.debug(`Message sent to topic ${topic}`, { topic });
  } catch (error) {
    logger.error(`Failed to send message to topic ${topic}`, { error, topic });
    throw error;
  }
};

/**
 * Create a consumer for a specific topic
 * @param groupId Consumer group ID
 * @param topics Topics to subscribe to
 * @param onMessage Message handler function
 */
export const createConsumer = async (
  groupId: string,
  topics: string[],
  onMessage: (topic: string, message: any) => Promise<void>
): Promise<Consumer> => {
  const consumerKey = `${groupId}-${topics.join(",")}`;

  // Return existing consumer if already created
  if (consumers.has(consumerKey)) {
    return consumers.get(consumerKey)!;
  }

  try {
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();

    // Subscribe to topics
    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    // Set up message handler
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value
            ? JSON.parse(message.value.toString())
            : null;
          await onMessage(topic, value);
        } catch (error) {
          logger.error(`Error processing message from topic ${topic}`, {
            error,
            topic,
            partition,
          });
        }
      },
    });

    // Store consumer in map
    consumers.set(consumerKey, consumer);
    logger.info(`Kafka consumer connected for topics: ${topics.join(", ")}`);

    return consumer;
  } catch (error) {
    logger.error("Failed to create Kafka consumer", { error, groupId, topics });
    throw error;
  }
};

/**
 * Disconnect all Kafka clients
 */
export const disconnectAll = async (): Promise<void> => {
  try {
    if (producer) {
      await producer.disconnect();
      producer = null;
      logger.info("Kafka producer disconnected");
    }

    for (const [key, consumer] of consumers.entries()) {
      await consumer.disconnect();
      consumers.delete(key);
      logger.info(`Kafka consumer ${key} disconnected`);
    }
  } catch (error) {
    logger.error("Error disconnecting Kafka clients", { error });
  }
};

// Handle process termination
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing Kafka connections");
  await disconnectAll();
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, closing Kafka connections");
  await disconnectAll();
});
