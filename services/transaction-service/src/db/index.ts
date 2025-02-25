import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { config } from "../config.js";
import { formatAmount } from "../types.js";
import {
  transactions,
  type Transaction,
  type TransactionStatus,
} from "./schema.js";
const { Pool } = pkg;

export class DrizzleClient {
  private db;
  private pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
    });
    this.db = drizzle(this.pool);
  }

  async createTransaction(data: {
    buyerId: string;
    sellerId: string;
    itemId: string;
    amount: number;
    status: TransactionStatus;
  }): Promise<Transaction> {
    const formattedAmount = formatAmount(data.amount);
    const [transaction] = await this.db
      .insert(transactions)
      .values({
        ...data,
        amount: formattedAmount,
      })
      .returning();
    return transaction;
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    try {
      const result = await this.db
        .select()
        .from(transactions)
        .where(eq(transactions.id, parseInt(id)));
      return result[0] || null;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  async getUserTransactions(
    userId: string,
    role?: string
  ): Promise<Transaction[]> {
    try {
      const query = this.db.select().from(transactions);

      if (role === "buyer") {
        return await query
          .where(eq(transactions.buyerId, userId))
          .orderBy(desc(transactions.createdAt));
      } else if (role === "seller") {
        return await query
          .where(eq(transactions.sellerId, userId))
          .orderBy(desc(transactions.createdAt));
      }

      return await query
        .where(
          and(
            eq(transactions.buyerId, userId),
            eq(transactions.sellerId, userId)
          )
        )
        .orderBy(desc(transactions.createdAt));
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      return [];
    }
  }

  async updateTransactionStatus(
    id: string,
    status: TransactionStatus
  ): Promise<Transaction | null> {
    try {
      const [transaction] = await this.db
        .update(transactions)
        .set({ status, updatedAt: new Date() })
        .where(eq(transactions.id, parseInt(id)))
        .returning();
      return transaction || null;
    } catch (error) {
      console.error("Error updating transaction status:", error);
      return null;
    }
  }

  async getUserMetrics(userId: string) {
    try {
      const userTransactions = await this.getUserTransactions(userId);
      const completedTransactions = userTransactions.filter(
        (t) => t.status === "COMPLETED"
      );

      const totalSales = completedTransactions
        .filter((t) => t.sellerId === userId)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const totalPurchases = completedTransactions
        .filter((t) => t.buyerId === userId)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        totalSales,
        totalPurchases,
        transactionCount: completedTransactions.length,
      };
    } catch (error) {
      console.error("Error calculating user metrics:", error);
      return {
        totalSales: 0,
        totalPurchases: 0,
        transactionCount: 0,
      };
    }
  }

  async closeConnection() {
    await this.pool.end();
  }
}
