"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  Store,
  Timer,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FoodItemProps {
  id: string;
  name: string;
  shop: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  storeImage?: string;
  availableUntil: string;
  quantity: number;
  storeAddress: string;
  distance: number;
  storeHoursToday: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

function formatStoreHours(time: string) {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function FoodItemCard({
  id,
  name,
  shop,
  originalPrice,
  discountedPrice,
  image,
  storeImage,
  availableUntil,
  quantity,
  storeAddress,
  distance,
  storeHoursToday,
  onReservationComplete,
}: FoodItemProps & { onReservationComplete?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReserve = async () => {
    setIsLoading(true);
    try {
      // Create the reservation
      await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: shop,
          items: [
            {
              name: name,
              quantity: selectedQty,
              originalPrice,
              discountPercentage: Math.round(
                100 - (discountedPrice / originalPrice) * 100
              ),
              image: image,
            },
          ],
          storeImage: storeImage || image,
          storeLocation: storeAddress,
          pickUpTime: `${new Date().toISOString().split("T")[0]}T${
            storeHoursToday.open
          }`,
          pickUpEndTime: `${new Date().toISOString().split("T")[0]}T${
            storeHoursToday.close
          }`,
        }),
      });

      // Step 2: Decrement stock
      await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          quantityReserved: selectedQty,
        }),
      });

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        onReservationComplete?.();
        router.push("/reservations/active");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="group bg-white rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-gray-200">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="absolute top-0 right-0 bg-gradient-to-bl from-green-500 to-emerald-600 text-white px-4 py-2 rounded-bl-xl text-sm font-semibold shadow-lg">
            {Math.round(100 - (discountedPrice / originalPrice) * 100)}% OFF
          </div>
        </div>

        <div className="p-5 space-y-4">
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Store className="w-4 h-4" />
            <p>{shop}</p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground border-t border-b border-gray-50 py-3">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Available until {formatDate(availableUntil)}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{storeAddress}</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600">
                <Navigation className="w-4 h-4" />
                <span>{distance.toFixed(1)} km</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
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
            <div className="flex items-center gap-1">
              <div>Stock: {quantity}</div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground line-through block">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="text-xl font-bold text-green-600 flex items-center gap-1">
                <span className="text-sm font-normal text-green-500">$</span>
                {discountedPrice.toFixed(2)}
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              className="rounded-full px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Reserve
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reserve Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Image and basic info */}
            <div className="flex gap-4">
              <div className="relative w-32 h-32">
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Store className="w-4 h-4" />
                  <p>{shop}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground line-through block">
                    ${originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xl font-bold text-green-600 flex items-center gap-1">
                    <span className="text-sm font-normal text-green-500">
                      $
                    </span>
                    {discountedPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Store details */}
            <div className="space-y-2 text-sm text-muted-foreground border-t border-b py-3">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Available until {formatDate(availableUntil)}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{storeAddress}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Navigation className="w-4 h-4" />
                  <span>{distance.toFixed(1)} km</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
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
            </div>

            {/* Quantity selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Select Quantity:</label>
                <span className="text-sm text-muted-foreground">
                  Available: {quantity}
                </span>
              </div>
              <Input
                type="number"
                min={1}
                max={quantity}
                value={selectedQty}
                onChange={(e) => setSelectedQty(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleReserve}
              disabled={isLoading || success}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : success ? (
                <>
                  <a>Success</a>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </>
              ) : (
                "Confirm Reservation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
