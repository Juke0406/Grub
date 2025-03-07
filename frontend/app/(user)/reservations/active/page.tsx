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
    id: "res_1",
    storeName: "Sweet Delights Bakery",
    storeLocation: "123 Orchard Road, #01-45",
    items: [
      {
        name: "Mystery Bread Bundle",
        quantity: 1,
        originalPrice: 40,
        discountedPrice: 20,
      },
      {
        name: "Assorted Pastries Pack",
        quantity: 1,
        originalPrice: 25,
        discountedPrice: 12.5,
      },
    ],
    status: "confirmed",
    pickupTime: "2025-03-08T17:00:00",
    pickupEndTime: "2025-03-08T18:00:00",
    totalSavings: 32.5,
    createdAt: "2025-03-08T10:25:00",
  },
  {
    id: "res_2",
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
    status: "ready",
    pickupTime: "2025-03-08T16:00:00",
    pickupEndTime: "2025-03-08T17:00:00",
    totalSavings: 15,
    createdAt: "2025-03-08T09:15:00",
  },
  {
    id: "res_3",
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
    status: "pending",
    pickupTime: "2025-03-08T19:00:00",
    pickupEndTime: "2025-03-08T20:00:00",
    totalSavings: 17.5,
    createdAt: "2025-03-08T11:30:00",
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

  return (
    <Card className="p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{reservation.storeName}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {reservation.storeLocation}
          </div>
        </div>
        <Badge className={status.color}>{status.label}</Badge>
      </div>

      <div className="space-y-2 flex-1">
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

      <div className="pt-4 border-t space-y-2 mt-4">
        <div className="flex items-center text-sm">
          <Clock className="h-4 w-4 mr-2" />
          <span>
            Pickup: {pickupDate.toLocaleTimeString()} -{" "}
            {endPickupDate.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <span>Total Savings: ${reservation.totalSavings.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 pt-4">
        <Button className="flex-1 min-w-[180px]">Get Directions</Button>
        <Button variant="outline" className="flex-1 min-w-[180px]">
          View Details
        </Button>
      </div>
    </Card>
  );
}

export default function ActiveReservationsPage() {
  const isMobile = useMobile();

  return (
    <div className="flex flex-col min-h-screen">
      <div className={isMobile ? "px-4" : "px-8"}>
        <div className="max-w-[1600px] mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-medium">Active Reservations</h1>
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
