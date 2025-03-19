"use client";

import { FoodItemCard } from "@/components/food-item-card";
import { Spinner } from "@/components/spinner";
import { StoreHeader } from "@/components/store-header";
import { Store } from "@/types/store";
import { useCallback, useEffect, useState } from "react";

interface StoreDetails {
  store: Store & {
    rating?: number;
    distance?: number;
  };
  products: {
    _id: string;
    name: string;
    originalPrice: number;
    discountedPrice: number;
    image: string;
    availableUntil: string;
    quantity: number;
  }[];
}

export default function StorePage({
  params,
}: {
  params: { id: string; type: string };
}) {
  const [data, setData] = useState<StoreDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStoreData = useCallback(async () => {
    try {
      const response = await fetch(`/api/stores/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch store data");
      }
      const data = await response.json();
      console.log("Store page data:", data);
      // Add random rating and distance for display purposes
      const formattedData = {
        store: {
          ...data.store,
          rating: Math.floor(Math.random() * 5) + 1,
          distance: Math.random() * 5,
        },
        products: data.products.map((product: any) => ({
          ...product,
          shop: data.store.name,
          availableUntil: product.inventory.expirationDate,
          quantity: product.inventory.quantity,
          image: product.imageUrl,
          distance: Math.random() * 5,
        })),
      };

      console.log("Formatted data:", formattedData);
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching store data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold">Store not found</h1>
      </div>
    );
  }

  const { store, products } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <StoreHeader store={store} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Available Items</h2>
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items available</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <FoodItemCard
                key={product._id}
                id={product._id}
                name={product.name}
                shop={store.name}
                originalPrice={product.originalPrice}
                discountedPrice={product.discountedPrice}
                image={product.image}
                availableUntil={product.availableUntil}
                quantity={product.quantity}
                storeAddress={store.location.address}
                storeHoursToday={{
                  open: store.businessHours[0].open,
                  close: store.businessHours[0].close,
                  isOpen: store.businessHours[0].isOpen,
                }}
                distance={store.distance || 0}
                onReservationComplete={fetchStoreData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
