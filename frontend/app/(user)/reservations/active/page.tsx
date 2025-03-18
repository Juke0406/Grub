"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useReservations } from "@/hooks/use-reservations";
import { useMobile } from "@/hooks/use-mobile";
import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { Reservation, STATUS_BADGES } from "@/types/reservation";
import { ReservationCard } from "@/components/reservation/reservation-card";
import { ReservationSkeleton } from "@/components/reservation/reservation-skeleton";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";

export default function ActiveReservationsPage() {
  const isMobile = useMobile();
  const { reservations, isLoading, error } = useReservations({
    status: "pending,confirmed,ready",
  });
  const [localReservations, setLocalReservations] = useState<Reservation[]>(reservations);

  // Keep local state in sync with the hook data
  useEffect(() => {
    setLocalReservations(reservations);
  }, [reservations]);

  const handleDelete = (id: string) => {
    setLocalReservations((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className={isMobile ? "px-4" : "px-8"}>
        <div className="max-w-[1600px] mx-auto py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-medium">Active Reservations</h1>
          </div>

          {error && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              // Show skeletons while loading
              Array(3)
                .fill(0)
                .map((_, index) => <ReservationSkeleton key={index} />)
            ) : reservations.length > 0 ? (
              // Show reservations if available
              reservations.map((reservation) => (
                <ReservationCard
                  key={reservation._id}
                  reservation={reservation}
                  onDelete={() => handleDelete(reservation._id)}
                />
              ))
            ) : (
              // Show message if no reservations
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium text-gray-500">
                  No active reservations
                </h3>
                <p className="text-gray-400 mt-2">
                  Browse available food items and make a reservation
                </p>
                <Button
                  className="mt-4"
                  onClick={() => redirect("/browse/all")}
                >
                  Browse Food
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
