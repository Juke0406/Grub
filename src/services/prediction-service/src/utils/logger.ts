import winston from "winston";
import { config } from "../config";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  defaultMeta: { service: "prediction-service" },
  transports: [
    // Write logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, service, ...meta }) => {
            return `[${timestamp}] ${service} ${level}: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
            }`;
          }
        )
      ),
    }),
  ],
});

// Add file transports in production
if (config.nodeEnv === "production") {
  logger.add(
    new winston.transports.File({ filename: "logs/error.log", level: "error" })
  );
  logger.add(new winston.transports.File({ filename: "logs/combined.log" }));
}
