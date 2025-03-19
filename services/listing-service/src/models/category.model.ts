import mongoose, { Document, Schema } from "mongoose";

// Category interface
export interface ICategory extends Document {
  name: string;
  description: string;
  slug: string;
  parentCategory?: mongoose.Types.ObjectId;
  businessId?: mongoose.Types.ObjectId;
  isGlobal: boolean;
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
      trim: true,
      maxlength: [500, "Category description cannot exceed 500 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
    },
    isGlobal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ businessId: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isGlobal: 1 });

// Generate slug from name before saving
categorySchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Create model
const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
