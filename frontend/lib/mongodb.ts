import { Db, MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.DATABASE_URL || "";
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

// if in development, we use a global variable to preserve connection across hot reload
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getClient(): Promise<MongoClient> {
  return clientPromise;
}

export async function getDatabase(databaseName?: string): Promise<Db> {
  const dbName = databaseName || process.env.DEFAULT_DATABASE || "default";
  const client = await clientPromise;
  return client.db(dbName);
}
