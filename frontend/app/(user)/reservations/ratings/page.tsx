"use client";

import { Card } from "@/components/ui/card";
import { useMobile } from "@/hooks/use-mobile";
import { Calendar, CheckCircle2, Star } from "lucide-react";

interface Reservation {
  id: string;
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

const mockReservations: Reservation[] = [
  {
    id: "res_6",
    storeName: "Sweet Delights Bakery",
    storeLocation: "123 Orchard Road, #01-45",
    items: [
      {
        name: "Mystery Bread Bundle",
        quantity: 1,
        originalPrice: 40,
        discountedPrice: 20,
      },
    ],
    status: "completed",
    pickupTime: "2025-03-05T17:00:00",
    pickupEndTime: "2025-03-05T18:00:00",
    totalSavings: 20,
    createdAt: "2025-03-05T10:25:00",
    rating: {
      score: 5,
      comment: "Amazing value! The bread was still fresh and delicious.",
      createdAt: "2025-03-05T19:00:00",
    },
  },
  {
    id: "res_7",
    storeName: "FreshMart Supermarket",
    storeLocation: "456 Tampines Mall, #02-12",
    items: [
      {
        name: "Fresh Produce Bundle",
        quantity: 1,
        originalPrice: 30,
        discountedPrice: 15,
      },
    ],
    status: "completed",
    pickupTime: "2025-03-04T16:00:00",
    pickupEndTime: "2025-03-04T17:00:00",
    totalSavings: 15,
    createdAt: "2025-03-04T09:15:00",
    rating: {
      score: 4,
      comment: "Great selection of vegetables and fruits. Will order again!",
      createdAt: "2025-03-04T18:00:00",
    },
  },
  {
    id: "res_9",
    storeName: "Artisan Breads",
    storeLocation: "789 Somerset Road, #03-21",
    items: [
      {
        name: "End-of-Day Bread Box",
        quantity: 1,
        originalPrice: 35,
        discountedPrice: 17.5,
      },
    ],
    status: "completed",
    pickupTime: "2025-03-03T19:00:00",
    pickupEndTime: "2025-03-03T20:00:00",
    totalSavings: 17.5,
    createdAt: "2025-03-03T11:30:00",
    rating: {
      score: 5,
      comment: "Perfect for my family dinner. Everything tasted amazing!",
      createdAt: "2025-03-03T20:30:00",
    },
  },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center space-x-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400 fill-current" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

function RatingCard({ reservation }: { reservation: Reservation }) {
  if (!reservation.rating) return null;

  const orderDate = new Date(reservation.pickupTime);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{reservation.storeName}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            {orderDate.toLocaleDateString()}
          </div>
        </div>
        <RatingStars rating={reservation.rating.score} />
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground italic">
          "{reservation.rating.comment}"
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="text-muted-foreground">
          {reservation.items.map((item, index) => (
            <div key={index} className="flex justify-between mb-1">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${item.discountedPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end pt-2 text-green-600">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          <span>Saved ${reservation.totalSavings.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}

export default function RatingsPage() {
  const isMobile = useMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <div className={isMobile ? "px-4" : "px-8"}>
        <div className="max-w-[1600px] mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-medium">My Ratings</h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockReservations.map((reservation) => (
              <RatingCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
