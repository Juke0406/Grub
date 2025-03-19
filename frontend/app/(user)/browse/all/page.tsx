"use client";

import { CategoryFilter } from "@/components/category-filter";
import { FoodItemCard } from "@/components/food-item-card";
import { SearchHeader } from "@/components/search-header";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Item {
  id: string;
  name: string;
  shop: string;
  type: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  distance: number;
  rating: number;
  availableUntil: string;
  quantity: number;
  storeAddress: string;
  storeHoursToday: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

export default function BrowseAllPage() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        const transformed = data.products.map((product: any) => ({
          id: product._id,
          name: product.name,
          shop: product.storeName || "Unknown Store",
          type: product.category,
          category: product.category,
          originalPrice: product.originalPrice,
          discountedPrice: product.discountedPrice,
          image: product.imageUrl,
          distance: Math.random() * 5,
          rating: Math.floor(Math.random() * 5) + 1,
          availableUntil: product.inventory.expirationDate,
          quantity: product.inventory.quantity,
          storeAddress: product.storeAddress || "Address not available",
          storeHoursToday: product.storeHoursToday || {
            open: "09:00",
            close: "17:00",
            isOpen: true,
          },
        }));
        setItems(transformed);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();
  }, []);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const isMobile = useMobile();
  const [items, setItems] = useState<Item[]>([]);

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.shop &&
        item.shop.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "nearest":
        return a.distance - b.distance;
      case "bestDeals":
        const aDiscount =
          (a.originalPrice - a.discountedPrice) / a.originalPrice;
        const bDiscount =
          (b.originalPrice - b.discountedPrice) / b.originalPrice;
        return bDiscount - aDiscount;
      case "rating":
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-col min-h-screen">
      <div className="w-full">
        <SearchHeader
          placeholder="Search for food items..."
          onSearch={setSearchQuery}
        />
        <div className={isMobile ? "px-4" : "px-8 py-2"}>
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </div>

      <div className={cn(isMobile ? "px-4" : "px-8", "pb-4")}>
        <div className="max-w-[1600px] mx-auto">
          {sortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No items found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "Check back later for new items."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedItems.map((item) => (
                <FoodItemCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  shop={item.shop}
                  originalPrice={item.originalPrice}
                  discountedPrice={item.discountedPrice}
                  image={item.image}
                  availableUntil={item.availableUntil}
                  quantity={item.quantity}
                  storeAddress={item.storeAddress}
                  storeHoursToday={item.storeHoursToday}
                  distance={item.distance}
                  onReservationComplete={async () => {
                    const response = await fetch("/api/products");
                    const data = await response.json();
                    const transformed = data.products.map((product: any) => ({
                      id: product._id,
                      name: product.name,
                      shop: product.storeName || "Unknown Store",
                      type: product.category,
                      category: product.category,
                      originalPrice: product.originalPrice,
                      discountedPrice: product.discountedPrice,
                      image: product.imageUrl,
                      distance: Math.random() * 5,
                      rating: Math.floor(Math.random() * 5) + 1,
                      availableUntil: product.inventory.expirationDate,
                      quantity: product.inventory.quantity,
                      storeAddress:
                        product.storeAddress || "Address not available",
                      storeHoursToday: product.storeHoursToday || {
                        open: "09:00",
                        close: "17:00",
                        isOpen: true,
                      },
                    }));
                    setItems(transformed);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
