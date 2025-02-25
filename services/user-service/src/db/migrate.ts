import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";
import { config } from "../config.js";
import * as schema from "./schema.js";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.database.url,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log("Migration started...");
  try {
    await migrate(db, { migrationsFolder: "migrations" });
    console.log("Migration completed!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed!");
  console.error(err);
  process.exit(1);
});
