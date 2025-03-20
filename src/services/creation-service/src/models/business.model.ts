import mongoose, { Document, Schema } from "mongoose";

// Business types
export enum BusinessType {
  BAKERY = "bakery",
  SUPERMARKET = "supermarket",
}

// Business document interface
export interface IBusiness extends Document {
  name: string;
  type: BusinessType;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  operatingHours: {
    monday: { open: string; close: string } | { closed: boolean };
    tuesday: { open: string; close: string } | { closed: boolean };
    wednesday: { open: string; close: string } | { closed: boolean };
    thursday: { open: string; close: string } | { closed: boolean };
    friday: { open: string; close: string } | { closed: boolean };
    saturday: { open: string; close: string } | { closed: boolean };
    sunday: { open: string; close: string } | { closed: boolean };
  };
  logo?: string;
  images?: string[];
  ownerId: mongoose.Types.ObjectId;
  active: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Business schema
const businessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      maxlength: [100, "Business name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      enum: Object.values(BusinessType),
      required: [true, "Business type is required"],
    },
    description: {
      type: String,
      required: [true, "Business description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    address: {
      street: {
        type: String,
        required: [true, "Street address is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
      },
      postalCode: {
        type: String,
        required: [true, "Postal code is required"],
        trim: true,
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
      },
    },
    contactInfo: {
      email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
        lowercase: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please provide a valid email address",
        ],
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
    },
    operatingHours: {
      monday: {
        type: Schema.Types.Mixed,
        required: true,
      },
      tuesday: {
        type: Schema.Types.Mixed,
        required: true,
      },
      wednesday: {
        type: Schema.Types.Mixed,
        required: true,
      },
      thursday: {
        type: Schema.Types.Mixed,
        required: true,
      },
      friday: {
        type: Schema.Types.Mixed,
        required: true,
      },
      saturday: {
        type: Schema.Types.Mixed,
        required: true,
      },
      sunday: {
        type: Schema.Types.Mixed,
        required: true,
      },
    },
    logo: {
      type: String,
    },
    images: {
      type: [String],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: [true, "Owner ID is required"],
      ref: "User",
    },
    active: {
      type: Boolean,
      default: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export Business model
export const Business = mongoose.model<IBusiness>("Business", businessSchema);
