import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file
dotenv.config({
  path: resolve(__dirname, "../.env"),
});

interface DatabaseConfig {
  url: string;
}

interface RedisConfig {
  url: string;
}

interface ServerConfig {
  port: number;
  env: string;
}

interface Config {
  database: DatabaseConfig;
  redis: RedisConfig;
  server: ServerConfig;
}

export const config: Config = {
  database: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@postgres:5432/gloria_users",
  },
  redis: {
    url: process.env.REDIS_URL || "redis://redis:6379",
  },
  server: {
    port: parseInt(process.env.PORT || "4004", 10),
    env: process.env.NODE_ENV || "development",
  },
};
