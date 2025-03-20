import mongoose, { Document, Schema } from "mongoose";

// Product status enum
export enum ProductStatus {
  ACTIVE = "active",
  SOLD_OUT = "sold_out",
  EXPIRED = "expired",
  DRAFT = "draft",
}

// Product interface
export interface IProduct extends Document {
  name: string;
  description: string;
  businessId: mongoose.Types.ObjectId;
  businessType: "bakery" | "supermarket";
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  quantity: number;
  quantityRemaining: number;
  categories: mongoose.Types.ObjectId[];
  images: string[];
  expiryDate: Date;
  pickupWindow: {
    start: Date;
    end: Date;
  };
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Product schema
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [1000, "Product description cannot exceed 1000 characters"],
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: [true, "Business ID is required"],
    },
    businessType: {
      type: String,
      enum: ["bakery", "supermarket"],
      required: [true, "Business type is required"],
    },
    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
      min: [0, "Original price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      required: [true, "Discounted price is required"],
      min: [0, "Discounted price cannot be negative"],
    },
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: [0, "Discount percentage cannot be negative"],
      max: [100, "Discount percentage cannot exceed 100"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    quantityRemaining: {
      type: Number,
      required: [true, "Quantity remaining is required"],
      min: [0, "Quantity remaining cannot be negative"],
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    images: [
      {
        type: String,
        validate: {
          validator: (value: string) => {
            // Simple URL validation
            return /^(http|https):\/\/[^ "]+$/.test(value);
          },
          message: "Invalid image URL",
        },
      },
    ],
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    pickupWindow: {
      start: {
        type: Date,
        required: [true, "Pickup window start time is required"],
      },
      end: {
        type: Date,
        required: [true, "Pickup window end time is required"],
      },
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ businessId: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ status: 1 });
productSchema.index({ expiryDate: 1 });
productSchema.index({ "pickupWindow.start": 1, "pickupWindow.end": 1 });
productSchema.index({ discountPercentage: -1 });

// Validate that discounted price is less than original price
productSchema.pre("validate", function (next) {
  if (this.discountedPrice > this.originalPrice) {
    this.invalidate(
      "discountedPrice",
      "Discounted price cannot be greater than original price"
    );
  }
  next();
});

// Validate that pickup window end is after start
productSchema.pre("validate", function (next) {
  if (this.pickupWindow.end <= this.pickupWindow.start) {
    this.invalidate(
      "pickupWindow.end",
      "Pickup window end time must be after start time"
    );
  }
  next();
});

// Calculate discount percentage before save
productSchema.pre("save", function (next) {
  if (this.originalPrice > 0) {
    this.discountPercentage = Math.round(
      ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
    );
  }
  next();
});

// Create model
export const Product = mongoose.model<IProduct>("Product", productSchema);
