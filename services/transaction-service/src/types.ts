import { Context } from "hono";
import { TransactionStatus } from "./db/schema.js";

export type HonoContext = Context;

export interface CreateTransactionBody {
  buyerId: string;
  sellerId: string;
  itemId: string;
  amount: string | number; // Accept both string and number for flexibility
}

export interface UpdateTransactionBody {
  status: TransactionStatus;
}

export interface TransactionResponse {
  id: number;
  buyerId: string;
  sellerId: string;
  itemId: string;
  amount: string; // Always return as string to preserve decimal precision
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionMetrics {
  totalSales: number;
  totalPurchases: number;
  transactionCount: number;
}

// Helper function to format amount to string with 2 decimal places
export function formatAmount(amount: string | number): string {
  return Number(amount).toFixed(2);
}

// Helper function to parse amount to number
export function parseAmount(amount: string | number): number {
  return Number(Number(amount).toFixed(2));
}

// Helper function to validate amount
export function isValidAmount(amount: string | number): boolean {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && num < 1000000000; // Reasonable limit for transaction amount
}
