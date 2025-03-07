"use client";

import { useMobile } from "@/hooks/use-mobile";
import { Star } from "lucide-react";

export default function RatingsHistoryPage() {
  const isMobile = useMobile();

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <div className={isMobile ? "px-4" : "px-8"}>
        <div className="max-w-[1600px] mx-auto py-6">
          <div className="flex items-center gap-2 mb-6">
            <h1 className="text-2xl font-bold">Your Ratings</h1>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="size-5 fill-current" />
              <span className="font-medium">4.8</span>
            </div>
          </div>
          <p className="text-muted-foreground mb-4">
            View your rating history and reviews for items you&apos;ve
            collected. Your rating score affects your ability to make future
            reservations.
          </p>
          {/* Rating history will be listed here */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-background rounded-lg border p-4">
              <p className="text-muted-foreground">No rating history</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
