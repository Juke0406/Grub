import mongoose, { Document, Schema } from "mongoose";

// Prediction status enum
export enum PredictionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Prediction type enum
export enum PredictionType {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  CUSTOM = "custom",
}

// Prediction item interface
export interface IPredictionItem {
  productId: string;
  productName: string;
  predictedDemand: number;
  confidence: number;
  recommendedStock: number;
}

// Prediction document interface
export interface IPrediction extends Document {
  businessId: string;
  type: PredictionType;
  status: PredictionStatus;
  startDate: Date;
  endDate: Date;
  items: IPredictionItem[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Prediction schema
const PredictionSchema = new Schema<IPrediction>(
  {
    businessId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(PredictionType),
      default: PredictionType.DAILY,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PredictionStatus),
      default: PredictionStatus.PENDING,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    items: [
      {
        productId: {
          type: String,
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        predictedDemand: {
          type: Number,
          required: true,
        },
        confidence: {
          type: Number,
          required: true,
          min: 0,
          max: 1,
        },
        recommendedStock: {
          type: Number,
          required: true,
        },
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
PredictionSchema.index({ businessId: 1, type: 1, startDate: 1, endDate: 1 });
PredictionSchema.index({ createdAt: 1 });

// Create model
export const Prediction = mongoose.model<IPrediction>(
  "Prediction",
  PredictionSchema
);
