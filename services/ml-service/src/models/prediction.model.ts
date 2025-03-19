import mongoose, { Document, Schema } from "mongoose";
import { ModelType } from "./ml-model.model";

// Prediction status enum
export enum PredictionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

// Prediction interface
export interface IPrediction extends Document {
  businessId: mongoose.Types.ObjectId;
  modelId: mongoose.Types.ObjectId;
  modelType: ModelType;
  targetId?: mongoose.Types.ObjectId; // Product/Bundle ID if applicable
  targetType?: "product" | "bundle" | "business";
  inputData: Record<string, any>;
  predictionResult: Record<string, any>;
  confidence: number;
  status: PredictionStatus;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Prediction schema
const predictionSchema = new Schema<IPrediction>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      required: [true, "Business ID is required"],
    },
    modelId: {
      type: Schema.Types.ObjectId,
      ref: "MLModel",
      required: [true, "Model ID is required"],
    },
    modelType: {
      type: String,
      enum: Object.values(ModelType),
      required: [true, "Model type is required"],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    targetType: {
      type: String,
      enum: ["product", "bundle", "business"],
      required: false,
    },
    inputData: {
      type: Schema.Types.Mixed,
      required: [true, "Input data is required"],
    },
    predictionResult: {
      type: Schema.Types.Mixed,
      default: {},
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(PredictionStatus),
      default: PredictionStatus.PENDING,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
predictionSchema.index({ businessId: 1 });
predictionSchema.index({ modelId: 1 });
predictionSchema.index({ targetId: 1, targetType: 1 });
predictionSchema.index({ status: 1 });
predictionSchema.index({ createdAt: 1 });

// Create model
export const Prediction = mongoose.model<IPrediction>(
  "Prediction",
  predictionSchema
);
