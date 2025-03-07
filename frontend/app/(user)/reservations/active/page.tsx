"use client";

import { useMobile } from "@/hooks/use-mobile";

export default function ActiveReservationsPage() {
  const isMobile = useMobile();

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <div className={isMobile ? "px-4" : "px-8"}>
        <div className="max-w-[1600px] mx-auto py-6">
          <h1 className="text-2xl font-bold mb-6">Active Reservations</h1>
          <p className="text-muted-foreground mb-4">
            View and manage your current reservations. Track pickup times and
            get directions to the stores.
          </p>
          {/* Active reservations will be listed here */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-background rounded-lg border p-4">
              <p className="text-muted-foreground">No active reservations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
