"use client";

import { CancelledReservationCard } from "@/components/reservation/reservation-cancelled-card";
import { ReservationSkeleton } from "@/components/reservation/reservation-skeleton";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { useReservations } from "@/hooks/use-reservations";
import { Reservation } from "@/types/reservation";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const isMobile = useMobile();
  const { reservations, isLoading, error } = useReservations({
    status: "completed,cancelled",
  });
  const [localReservations, setLocalReservations] =
    useState<Reservation[]>(reservations);

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
            <h1 className="text-2xl font-medium">Reservation History</h1>
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
            ) : localReservations.length > 0 ? (
              // Show reservations if available
              localReservations.map((reservation) => (
                <CancelledReservationCard
                  key={reservation._id}
                  reservation={reservation}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              // Show message if no reservations
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium text-gray-500">
                  No reservation history
                </h3>
                <p className="text-gray-400 mt-2">
                  Your completed and cancelled reservations will appear here
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
