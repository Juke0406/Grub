import mongoose, { Document, Schema } from "mongoose";
import { ProductStatus } from "./product.model";

// Bundle interface
export interface IBundle extends Document {
  name: string;
  description: string;
  businessId: mongoose.Types.ObjectId;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  products: {
    productId: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  totalQuantity: number;
  quantityRemaining: number;
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

// Bundle schema
const bundleSchema = new Schema<IBundle>(
  {
    name: {
      type: String,
      required: [true, "Bundle name is required"],
      trim: true,
      maxlength: [100, "Bundle name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Bundle description is required"],
      trim: true,
      maxlength: [1000, "Bundle description cannot exceed 1000 characters"],
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: [true, "Business ID is required"],
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
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product ID is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Product quantity is required"],
          min: [1, "Product quantity must be at least 1"],
        },
      },
    ],
    totalQuantity: {
      type: Number,
      required: [true, "Total quantity is required"],
      min: [1, "Total quantity must be at least 1"],
    },
    quantityRemaining: {
      type: Number,
      required: [true, "Quantity remaining is required"],
      min: [0, "Quantity remaining cannot be negative"],
    },
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
bundleSchema.index({ businessId: 1 });
bundleSchema.index({ status: 1 });
bundleSchema.index({ expiryDate: 1 });
bundleSchema.index({ "pickupWindow.start": 1, "pickupWindow.end": 1 });
bundleSchema.index({ discountPercentage: -1 });
bundleSchema.index({ "products.productId": 1 });

// Validate that discounted price is less than original price
bundleSchema.pre("validate", function (next) {
  if (this.discountedPrice > this.originalPrice) {
    this.invalidate(
      "discountedPrice",
      "Discounted price cannot be greater than original price"
    );
  }
  next();
});

// Validate that pickup window end is after start
bundleSchema.pre("validate", function (next) {
  if (this.pickupWindow.end <= this.pickupWindow.start) {
    this.invalidate(
      "pickupWindow.end",
      "Pickup window end time must be after start time"
    );
  }
  next();
});

// Calculate discount percentage before save
bundleSchema.pre("save", function (next) {
  if (this.originalPrice > 0) {
    this.discountPercentage = Math.round(
      ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
    );
  }
  next();
});

// Create model
const Bundle = mongoose.model<IBundle>("Bundle", bundleSchema);

export default Bundle;
