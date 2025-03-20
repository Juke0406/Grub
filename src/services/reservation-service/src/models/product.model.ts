import mongoose, { Document, Schema } from "mongoose";

// Product category enum
export enum ProductCategory {
  BREAD = "bread",
  PASTRY = "pastry",
  CAKE = "cake",
  DAIRY = "dairy",
  MEAT = "meat",
  PRODUCE = "produce",
  GROCERY = "grocery",
  BUNDLE = "bundle",
}

// Product inventory interface
export interface IProductInventory {
  quantity: number;
  expirationDate: string;
}

// Product interface
export interface IProduct extends Document {
  SKU: string;
  imageUrl: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  category: ProductCategory;
  userID: string; // Business owner ID
  inventory: IProductInventory;
  createdAt: Date;
  updatedAt: Date;
}

// Product inventory schema
const ProductInventorySchema = new Schema<IProductInventory>({
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  expirationDate: {
    type: String,
    required: true,
  },
});

// Product schema
const ProductSchema = new Schema<IProduct>(
  {
    SKU: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (this: IProduct) {
          return this.discountedPrice <= this.originalPrice;
        },
        message:
          "Discounted price must be less than or equal to original price",
      },
    },
    category: {
      type: String,
      enum: Object.values(ProductCategory),
      required: true,
      index: true,
    },
    userID: {
      type: String,
      required: true,
      index: true,
    },
    inventory: {
      type: ProductInventorySchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export Product model
export const Product = mongoose.model<IProduct>("Product", ProductSchema);
