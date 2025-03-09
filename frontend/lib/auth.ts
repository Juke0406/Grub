import { betterAuth, BetterAuthOptions } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.DB_CONN_STRING || "");
const db = client.db(process.env.DB_NAME);

export const auth = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
        enabled: true,
    },
} satisfies BetterAuthOptions);