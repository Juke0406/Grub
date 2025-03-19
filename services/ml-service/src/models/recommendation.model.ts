import mongoose, { Document, Schema } from "mongoose";

// Recommendation type enum
export enum RecommendationType {
  INVENTORY = "inventory",
  PRICING = "pricing",
  PRODUCT_MIX = "product_mix",
  BUNDLE_SUGGESTION = "bundle_suggestion",
  EXPIRY_MANAGEMENT = "expiry_management",
}

// Recommendation status enum
export enum RecommendationStatus {
  ACTIVE = "active",
  IMPLEMENTED = "implemented",
  DISMISSED = "dismissed",
  EXPIRED = "expired",
}

// Recommendation interface
export interface IRecommendation extends Document {
  businessId: mongoose.Types.ObjectId;
  type: RecommendationType;
  title: string;
  description: string;
  details: Record<string, any>;
  potentialImpact: {
    metric: string;
    value: number;
    unit: string;
  }[];
  confidence: number;
  status: RecommendationStatus;
  expiresAt: Date;
  implementedAt?: Date;
  dismissedAt?: Date;
  dismissReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Recommendation schema
const recommendationSchema = new Schema<IRecommendation>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      required: [true, "Business ID is required"],
    },
    type: {
      type: String,
      enum: Object.values(RecommendationType),
      required: [true, "Recommendation type is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    details: {
      type: Schema.Types.Mixed,
      required: [true, "Recommendation details are required"],
    },
    potentialImpact: [
      {
        metric: {
          type: String,
          required: [true, "Impact metric is required"],
        },
        value: {
          type: Number,
          required: [true, "Impact value is required"],
        },
        unit: {
          type: String,
          required: [true, "Impact unit is required"],
        },
      },
    ],
    confidence: {
      type: Number,
      required: [true, "Confidence score is required"],
      min: 0,
      max: 1,
    },
    status: {
      type: String,
      enum: Object.values(RecommendationStatus),
      default: RecommendationStatus.ACTIVE,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
    },
    implementedAt: {
      type: Date,
    },
    dismissedAt: {
      type: Date,
    },
    dismissReason: {
      type: String,
      maxlength: [500, "Dismiss reason cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
recommendationSchema.index({ businessId: 1 });
recommendationSchema.index({ type: 1 });
recommendationSchema.index({ status: 1 });
recommendationSchema.index({ expiresAt: 1 });
recommendationSchema.index({ confidence: -1 });

// Create model
export const Recommendation = mongoose.model<IRecommendation>(
  "Recommendation",
  recommendationSchema
);
