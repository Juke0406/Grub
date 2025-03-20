import mongoose, { Document, Schema } from "mongoose";

// Reservation status enum
export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  READY = "ready",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// Reservation item interface
export interface IReservationItem {
  productId: string;
  name: string;
  quantity: number;
  originalPrice: number;
  discountPercentage: number;
}

// Rating interface
export interface IRating {
  score: number;
  comment?: string;
  createdAt: string;
}

// Reservation interface
export interface IReservation extends Document {
  userId: string;
  storeName: string;
  storeLocation: string;
  items: IReservationItem[];
  status: ReservationStatus;
  pickupTime: string;
  pickupEndTime: string;
  createdAt: string;
  updatedAt: string;
  rating?: IRating;
}

// Reservation item schema
const ReservationItemSchema = new Schema<IReservationItem>({
  productId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

// Rating schema
const RatingSchema = new Schema<IRating>({
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString(),
  },
});

// Reservation schema
const ReservationSchema = new Schema<IReservation>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    storeLocation: {
      type: String,
      required: true,
    },
    items: {
      type: [ReservationItemSchema],
      required: true,
      validate: {
        validator: function (items: IReservationItem[]) {
          return items.length > 0;
        },
        message: "Reservation must have at least one item",
      },
    },
    status: {
      type: String,
      enum: Object.values(ReservationStatus),
      default: ReservationStatus.PENDING,
    },
    pickupTime: {
      type: String,
      required: true,
    },
    pickupEndTime: {
      type: String,
      required: true,
    },
    rating: {
      type: RatingSchema,
    },
  },
  {
    timestamps: {
      currentTime: () => new Date().toISOString(),
    },
  }
);

// Create and export Reservation model
export const Reservation = mongoose.model<IReservation>(
  "Reservation",
  ReservationSchema
);
