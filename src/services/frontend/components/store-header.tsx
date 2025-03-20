"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Store } from "@/types/store";
import { Clock, MapPin, Navigation, StoreIcon, Timer } from "lucide-react";
import Image from "next/image";

interface StoreHeaderProps {
  store: Store & {
    rating?: number;
    distance?: number;
  };
}

function formatStoreHours(time: string) {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function StoreHeader({ store }: StoreHeaderProps) {
  const today = new Date().getDay();
  // Convert Sunday from 0 to 6 for array index
  const dayIndex = today === 0 ? 6 : today - 1;
  const storeHoursToday = store.businessHours[dayIndex];

  return (
    <Card className="w-full overflow-hidden mb-8 py-0 gap-0">
      <div className="relative h-[300px] bg-muted">
        {store.image ? (
          <Image
            src={store.image}
            alt={store.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <StoreIcon className="w-24 h-24 text-muted-foreground opacity-20" />
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{store.name}</h1>
            <p className="text-lg text-muted-foreground mt-1">
              {store.description}
            </p>
          </div>
          {store.rating && (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              ⭐ {store.rating.toFixed(1)}
            </Badge>
          )}
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{store.location.address}</span>
            </div>
            {store.distance && (
              <div className="flex items-center gap-2 text-blue-600">
                <Navigation className="w-4 h-4" />
                <span>{store.distance.toFixed(1)} km</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span
              className={
                storeHoursToday.isOpen ? "text-green-600" : "text-red-500"
              }
            >
              {storeHoursToday.isOpen ? "Open" : "Closed"} ·{" "}
              {formatStoreHours(storeHoursToday.open)} -{" "}
              {formatStoreHours(storeHoursToday.close)}
            </span>
          </div>

          {store.contactNumber && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{store.contactNumber}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
