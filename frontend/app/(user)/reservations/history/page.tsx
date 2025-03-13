"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMobile } from "@/hooks/use-mobile";
import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { Reservation, STATUS_BADGES } from "@/types/reservation";
import { ReservationCard } from "@/components/reservation/reservation-card";
import { ReservationSkeleton } from "@/components/reservation/reservation-skeleton";
import { useReservations } from "@/hooks/use-reservations";
import { redirect } from "next/navigation";

export default function HistoryPage() {
  const isMobile = useMobile();
  const { reservations, isLoading, error } = useReservations({
    status: "completed,cancelled",
  });

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
            ) : reservations.length > 0 ? (
              // Show reservations if available
              reservations.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
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
