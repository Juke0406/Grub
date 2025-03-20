import mongoose, { Document, Schema } from "mongoose";

/**
 * Interface representing an API key document in MongoDB
 */
export interface IApiKey extends Document {
  key: string;
  userId: string;
  name?: string;
  description?: string;
  tier: "standard" | "premium" | "enterprise";
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
  isActive: boolean;
  permissions: string[];
}

/**
 * Mongoose schema for API keys
 */
const ApiKeySchema = new Schema<IApiKey>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tier: {
      type: String,
      enum: ["standard", "premium", "enterprise"],
      default: "standard",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastUsedAt: {
      type: Date,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create indexes for efficient queries
ApiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic expiration
ApiKeySchema.index({ userId: 1, createdAt: -1 }); // For listing user's keys by creation date

/**
 * Check if API key is expired
 */
ApiKeySchema.methods.isExpired = function (): boolean {
  return this.expiresAt < new Date();
};

/**
 * Update last used timestamp and increment usage count
 */
ApiKeySchema.methods.updateUsage = async function (): Promise<void> {
  this.lastUsedAt = new Date();
  this.usageCount += 1;
  await this.save();
};

// Create and export the model
const ApiKey = mongoose.model<IApiKey>("ApiKey", ApiKeySchema);

export default ApiKey;
