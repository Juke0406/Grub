import mongoose, { Document, Schema } from "mongoose";

// Category document interface
export interface ICategory extends Document {
  name: string;
  description: string;
  businessId: mongoose.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category schema
const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Category description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    businessId: {
      type: Schema.Types.ObjectId,
      required: [true, "Business ID is required"],
      ref: "Business",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for unique category names per business
categorySchema.index({ name: 1, businessId: 1 }, { unique: true });

// Create and export Category model
export const Category = mongoose.model<ICategory>("Category", categorySchema);
