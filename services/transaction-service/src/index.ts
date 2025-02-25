import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { DrizzleClient } from "./db/index.js";
import type {
  CreateTransactionBody,
  HonoContext,
  TransactionMetrics,
  TransactionResponse,
  UpdateTransactionBody,
} from "./types.js";
import { formatAmount, isValidAmount, parseAmount } from "./types.js";

const app = new Hono<{ Bindings: {}; Variables: {} }>();
app.use("*", cors());
app.use("*", prettyJSON());

const db = new DrizzleClient();

// Create a new transaction
app.post("/transactions", async (c: HonoContext) => {
  const body = await c.req.json<CreateTransactionBody>();
  const { buyerId, sellerId, itemId, amount } = body;

  if (!buyerId || !sellerId || !itemId || !amount) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  if (!isValidAmount(amount)) {
    return c.json({ error: "Invalid amount" }, 400);
  }

  try {
    const transaction = await db.createTransaction({
      buyerId,
      sellerId,
      itemId,
      amount: parseAmount(amount),
      status: "PENDING",
    });

    // Format the response
    const response: TransactionResponse = {
      ...transaction,
      amount: formatAmount(transaction.amount),
    };

    return c.json(response, 201);
  } catch (error) {
    return c.json({ error: "Failed to create transaction" }, 500);
  }
});

// Get transaction by ID
app.get("/transactions/:id", async (c: HonoContext) => {
  const id = c.req.param("id");
  try {
    const transaction = await db.getTransaction(id);
    if (!transaction) {
      return c.json({ error: "Transaction not found" }, 404);
    }

    // Format the response
    const response: TransactionResponse = {
      ...transaction,
      amount: formatAmount(transaction.amount),
    };

    return c.json(response);
  } catch (error) {
    return c.json({ error: "Failed to fetch transaction" }, 500);
  }
});

// Get user's transactions (as buyer or seller)
app.get("/users/:userId/transactions", async (c: HonoContext) => {
  const userId = c.req.param("userId");
  const role = c.req.query("role"); // 'buyer' or 'seller'

  try {
    const transactions = await db.getUserTransactions(userId, role);

    // Format the response
    const response: TransactionResponse[] = transactions.map((transaction) => ({
      ...transaction,
      amount: formatAmount(transaction.amount),
    }));

    return c.json(response);
  } catch (error) {
    return c.json({ error: "Failed to fetch transactions" }, 500);
  }
});

// Update transaction status
app.patch("/transactions/:id", async (c: HonoContext) => {
  const id = c.req.param("id");
  const body = await c.req.json<UpdateTransactionBody>();
  const { status } = body;

  try {
    const transaction = await db.updateTransactionStatus(id, status);
    if (!transaction) {
      return c.json({ error: "Transaction not found" }, 404);
    }

    // Format the response
    const response: TransactionResponse = {
      ...transaction,
      amount: formatAmount(transaction.amount),
    };

    return c.json(response);
  } catch (error) {
    return c.json({ error: "Failed to update transaction" }, 500);
  }
});

// Get metrics for a user
app.get("/users/:userId/metrics", async (c: HonoContext) => {
  const userId = c.req.param("userId");

  try {
    const metrics = await db.getUserMetrics(userId);

    // Format the metrics with proper precision
    const response: TransactionMetrics = {
      totalSales: Number(formatAmount(metrics.totalSales)),
      totalPurchases: Number(formatAmount(metrics.totalPurchases)),
      transactionCount: metrics.transactionCount,
    };

    return c.json(response);
  } catch (error) {
    return c.json({ error: "Failed to fetch metrics" }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port: 4005,
  },
  (info) => {
    console.log(`Transaction service running on http://localhost:${info.port}`);
  }
);
