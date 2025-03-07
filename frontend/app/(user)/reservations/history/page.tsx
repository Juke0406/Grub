"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMobile } from "@/hooks/use-mobile";
import { CheckCircle2, Clock, MapPin } from "lucide-react";

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
    id: "res_4",
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
    pickupTime: "2025-03-07T17:00:00",
    pickupEndTime: "2025-03-07T18:00:00",
    totalSavings: 20,
    createdAt: "2025-03-07T10:25:00",
  },
  {
    id: "res_5",
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
    pickupTime: "2025-03-06T19:00:00",
    pickupEndTime: "2025-03-06T20:00:00",
    totalSavings: 17.5,
    createdAt: "2025-03-06T11:30:00",
  },
  {
    id: "res_8",
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
    status: "cancelled",
    pickupTime: "2025-03-05T16:00:00",
    pickupEndTime: "2025-03-05T17:00:00",
    totalSavings: 15,
    createdAt: "2025-03-05T09:15:00",
  },
];

const STATUS_BADGES = {
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

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const pickupDate = new Date(reservation.pickupTime);
  const endPickupDate = new Date(reservation.pickupEndTime);
  const status = STATUS_BADGES[reservation.status];
  const orderDate = new Date(reservation.createdAt);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{reservation.storeName}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {reservation.storeLocation}
          </div>
        </div>
        <Badge className={status.color}>{status.label}</Badge>
      </div>

      <div className="space-y-2">
        {reservation.items.map((item, index) => (
          <div key={index} className="flex justify-between items-start text-sm">
            <div>
              <p>
                {item.name} × {item.quantity}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Original: ${item.originalPrice.toFixed(2)}
              </p>
            </div>
            <p className="font-medium">${item.discountedPrice.toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t space-y-2">
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-2" />
          <span>
            Pickup: {pickupDate.toLocaleDateString()},{" "}
            {pickupDate.toLocaleTimeString()} -{" "}
            {endPickupDate.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <span>Total Savings: ${reservation.totalSavings.toFixed(2)}</span>
        </div>
      </div>

      {reservation.status === "completed" && !reservation.rating && (
        <div className="pt-4">
          <Button variant="outline" className="w-full">
            Rate Order
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function HistoryPage() {
  const isMobile = useMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <div className={isMobile ? "px-4" : "px-8"}>
        <div className="max-w-[1600px] mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-medium">Reservation History</h1>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
