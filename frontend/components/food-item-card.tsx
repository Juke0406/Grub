
"use client";

import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2 } from "lucide-react";

interface FoodItemProps {
  id: string;
  name: string;
  shop: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  availableUntil: string;
  quantity: number;
}

export function FoodItemCard({
  id,
  name,
  shop,
  originalPrice,
  discountedPrice,
  image,
  availableUntil,
  quantity,
}: FoodItemProps) {
  const [open, setOpen] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // const handleReserve = async () => {
  //   setIsLoading(true);
  //   try {
  //     const res = await fetch('/api/reservation', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         storeName: shop,
  //         items: [
  //           {
  //             name: name,
  //             quantity: selectedQty,
  //             originalPrice: originalPrice,
  //             discountPercentage: Math.round(100 - (discountedPrice / originalPrice) * 100),
  //           },
  //         ],
  //         storeLocation: "placeholder-location",
  //         pickUpTime: "2025-03-11T14:00:00Z",
  //         pickUpEndTime: "2025-03-11T17:00:00Z",
  //       }),
  //     });
  //     await res.json();
  //     setSuccess(true);
  //     setTimeout(() => {
  //       setOpen(false);
  //       setSuccess(false);
  //     }, 1500);
  //   } catch (error) {
  //     console.error("Error:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleReserve = async () => {
    setIsLoading(true);
    try {
      // Step 1: Make reservation
      await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: shop,
          items: [{ name: name, quantity: selectedQty, originalPrice, discountPercentage: Math.round(100 - (discountedPrice / originalPrice) * 100) }],
          storeLocation: "placeholder-location",
          pickUpTime: "2025-03-11T14:00:00Z",
          pickUpEndTime: "2025-03-11T17:00:00Z",
        }),
      });
  
      // Step 2: Decrement stock
      await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id, // make sure you pass `id` as prop to FoodItemCard
          quantityReserved: selectedQty,
        }),
      });
  
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <>
      <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-gray-200">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-0 right-0 bg-gradient-to-bl from-green-500 to-emerald-600 text-white px-4 py-2 rounded-bl-xl text-sm font-semibold shadow-lg">
            {Math.round(100 - (discountedPrice / originalPrice) * 100)}% OFF
          </div>
        </div>

        <div className="p-5 space-y-4">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground">{shop}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-b border-gray-50 py-3">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{availableUntil}</span>
            </div>
            <div>
              Stock: {quantity}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserve {name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Available stock: {quantity}</p>
            <div>
              <label className="text-sm mb-1 block">Select Quantity:</label>
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
            <Button onClick={handleReserve} disabled={isLoading || success} className="w-full">
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
