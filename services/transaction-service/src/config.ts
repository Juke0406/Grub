import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file
dotenv.config({
  path: resolve(__dirname, "../.env"),
});

interface DatabaseConfig {
  url: string;
}

interface ServerConfig {
  port: number;
  env: string;
}

interface Config {
  database: DatabaseConfig;
  server: ServerConfig;
}

export const config: Config = {
  database: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@postgres:5432/gloria_transactions",
  },
  server: {
    port: parseInt(process.env.PORT || "4005", 10),
    env: process.env.NODE_ENV || "development",
  },
};
