import { InferModel } from "drizzle-orm";
import {
  decimal,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const transactionStatusEnum = pgEnum("transaction_status", [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const);

export type TransactionStatus =
  (typeof transactionStatusEnum.enumValues)[number];

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  buyerId: text("buyer_id").notNull(),
  sellerId: text("seller_id").notNull(),
  itemId: text("item_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Transaction = InferModel<typeof transactions>;
export type NewTransaction = InferModel<typeof transactions, "insert">;
