import winston from "winston";
import config from "../config";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
      stack ? `\n${stack}` : ""
    }`;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  defaultMeta: { service: "api-service" },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),

    // File transport for production
    ...(config.nodeEnv === "production"
      ? [
          // Error log
          new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
          }),
          // Combined log
          new winston.transports.File({
            filename: "logs/combined.log",
          }),
        ]
      : []),
  ],
});

// Create a stream object for Morgan integration
export const logStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
