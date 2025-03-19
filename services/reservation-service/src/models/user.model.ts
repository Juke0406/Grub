import mongoose, { Document, Schema } from "mongoose";

// User roles
export enum UserRole {
  CONSUMER = "consumer",
  BAKERY = "bakery",
  SUPERMARKET = "supermarket",
  ADMIN = "admin",
}

// User interface
export interface IUser extends Document {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  businessName?: string;
  businessAddress?: string;
  phoneNumber?: string;
  rating?: number;
  ratingCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const UserSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CONSUMER,
    },
    businessName: {
      type: String,
      trim: true,
    },
    businessAddress: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export User model
export const User = mongoose.model<IUser>("User", UserSchema);
