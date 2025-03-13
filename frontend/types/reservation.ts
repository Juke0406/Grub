export interface Reservation {
  id: string;
  userId: string;
  storeName: string;
  storeLocation: string;
  items: {
    name: string;
    quantity: number;
    originalPrice: number;
    discountedPrice: number;
  }[];
  status: "pending" | "confirmed" | "ready" | "completed" | "cancelled";
  pickupTime: string;
  pickupEndTime: string;
  totalSavings: number;
  createdAt: string;
  rating?: {
    score: number;
    comment?: string;
    createdAt: string;
  };
}

export const STATUS_BADGES = {
  pending: {
    label: "Pending Confirmation",
    color: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/10",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/10",
  },
  ready: {
    label: "Ready for Pickup",
    color: "bg-green-500/10 text-green-500 hover:bg-green-500/10",
  },
  completed: {
    label: "Completed",
    color: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/10",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500/10 text-red-500 hover:bg-red-500/10",
  },
};
