import mongoose, { Document, Schema } from "mongoose";

// ML Model types
export enum ModelType {
  DEMAND_PREDICTION = "demand_prediction",
  PRICE_OPTIMIZATION = "price_optimization",
  INVENTORY_FORECAST = "inventory_forecast",
  EXPIRY_PREDICTION = "expiry_prediction",
  CUSTOM = "custom",
}

// ML Algorithm types
export enum AlgorithmType {
  LINEAR_REGRESSION = "linear_regression",
  RANDOM_FOREST = "random_forest",
  GRADIENT_BOOSTING = "gradient_boosting",
  NEURAL_NETWORK = "neural_network",
  ARIMA = "arima",
  CUSTOM = "custom",
}

// ML Model interface
export interface IMLModel extends Document {
  name: string;
  description: string;
  businessId: mongoose.Types.ObjectId;
  modelType: ModelType;
  algorithm: AlgorithmType;
  parameters: Record<string, any>;
  features: string[];
  target: string;
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    mse?: number;
    rmse?: number;
    mae?: number;
    r2?: number;
  };
  serializedModel: string; // JSON stringified model
  version: number;
  isActive: boolean;
  trainingDataPoints: number;
  lastTrainedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ML Model schema
const mlModelSchema = new Schema<IMLModel>(
  {
    name: {
      type: String,
      required: [true, "Model name is required"],
      trim: true,
      maxlength: [100, "Model name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Model description is required"],
      trim: true,
      maxlength: [1000, "Model description cannot exceed 1000 characters"],
    },
    businessId: {
      type: Schema.Types.ObjectId,
      required: [true, "Business ID is required"],
    },
    modelType: {
      type: String,
      enum: Object.values(ModelType),
      required: [true, "Model type is required"],
    },
    algorithm: {
      type: String,
      enum: Object.values(AlgorithmType),
      required: [true, "Algorithm type is required"],
    },
    parameters: {
      type: Schema.Types.Mixed,
      required: [true, "Model parameters are required"],
    },
    features: {
      type: [String],
      required: [true, "Model features are required"],
    },
    target: {
      type: String,
      required: [true, "Target variable is required"],
    },
    metrics: {
      accuracy: Number,
      precision: Number,
      recall: Number,
      f1Score: Number,
      mse: Number,
      rmse: Number,
      mae: Number,
      r2: Number,
    },
    serializedModel: {
      type: String,
      required: [true, "Serialized model is required"],
    },
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    trainingDataPoints: {
      type: Number,
      required: [true, "Number of training data points is required"],
    },
    lastTrainedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mlModelSchema.index({ businessId: 1 });
mlModelSchema.index({ modelType: 1 });
mlModelSchema.index({ isActive: 1 });
mlModelSchema.index({ businessId: 1, modelType: 1, isActive: 1 });

// Create model
export const MLModel = mongoose.model<IMLModel>("MLModel", mlModelSchema);
