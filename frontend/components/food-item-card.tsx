"use client";

import { Button } from "@/components/ui/button";
import { Clock, MapPin, Star } from "lucide-react";

interface FoodItemProps {
  name: string;
  shop: string;
  type: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  distance: string;
  rating: number;
  availableUntil: string;
}

export function FoodItemCard({
  name,
  shop,
  originalPrice,
  discountedPrice,
  image,
  distance,
  rating,
  availableUntil,
}: FoodItemProps) {
  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-gray-200">
      {/* Image Container */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-0 right-0 bg-gradient-to-bl from-green-500 to-emerald-600 text-white px-4 py-2 rounded-bl-xl text-sm font-semibold shadow-lg">
          50% OFF
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-semibold text-lg tracking-tight leading-tight">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              {shop}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-green-700">{rating}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-b border-gray-50 py-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{distance}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{availableUntil}</span>
          </div>
        </div>

        {/* Pricing & Action */}
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
            className="rounded-full px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Reserve
          </Button>
        </div>
      </div>
    </div>
  );
}
