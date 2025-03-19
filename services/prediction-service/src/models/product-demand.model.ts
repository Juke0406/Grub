import mongoose, { Document, Schema } from "mongoose";

// Product demand document interface
export interface IProductDemand extends Document {
  productId: string;
  businessId: string;
  date: Date;
  quantity: number;
  reservationCount: number;
  salesCount: number;
  wastageCount: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Product demand schema
const ProductDemandSchema = new Schema<IProductDemand>(
  {
    productId: {
      type: String,
      required: true,
      index: true,
    },
    businessId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    reservationCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    salesCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    wastageCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
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
ProductDemandSchema.index({ productId: 1, date: 1 });
ProductDemandSchema.index({ businessId: 1, date: 1 });
ProductDemandSchema.index({ date: 1 });

// Create model
export const ProductDemand = mongoose.model<IProductDemand>(
  "ProductDemand",
  ProductDemandSchema
);
