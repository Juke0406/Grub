import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const doMigrate = async () => {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/gloria_items";

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log("Starting migration for item service...");

  await migrate(db, {
    migrationsFolder: "drizzle",
  });

  console.log("Migration completed");
  await sql.end();
};

doMigrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
