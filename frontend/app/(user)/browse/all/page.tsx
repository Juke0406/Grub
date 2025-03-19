"use client";

import { CategoryFilter } from "@/components/category-filter";
import { FoodItemCard } from "@/components/food-item-card";
import { SearchHeader } from "@/components/search-header";
import { useMobile } from "@/hooks/use-mobile";
import data from "@/lib/data.json";
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
}

// Transform data from bakeries and supermarkets into a unified format
const transformedItems = [
  ...data.bakeries.flatMap((bakery) =>
    bakery.items.map((item) => ({
      id: item.id,
      name: item.name,
      shop: bakery.name,
      type: "bakery",
      category: item.name.toLowerCase().includes("mystery")
        ? "mystery"
        : item.name.toLowerCase().includes("bread")
        ? "bread"
        : "pastries",
      originalPrice: item.originalPrice,
      discountedPrice: item.discountedPrice,
      image: item.image,
      distance: Math.random() * 5, // In a real app, this would be calculated based on user's location
      rating: bakery.rating,
      availableUntil: item.pickupPeriod,
      quantity: item.quantity,
    }))
  ),
  ...data.supermarkets.flatMap((supermarket) =>
    supermarket.items.map((item) => ({
      id: item.id,
      name: item.name,
      shop: supermarket.name,
      type: "supermarket",
      category: item.name.toLowerCase().includes("meat") ? "meat" : "produce",
      originalPrice: item.originalPrice,
      discountedPrice: item.discountedPrice,
      image: item.image,
      distance: Math.random() * 5, // In a real app, this would be calculated based on user's location
      rating: supermarket.rating,
      availableUntil: item.pickupPeriod,
      quantity: item.quantity,
    }))
  ),
];

export default function BrowseAllPage() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        const transformed = data.products.map((product: any) => ({
          id: product._id,
          name: product.name,
          shop: product.storeId || "Unknown Store",
          type: product.category, // assuming "type" = category
          category: product.category,
          originalPrice: product.originalPrice,
          discountedPrice: product.discountedPrice,
          image: product.imageUrl,
          distance: Math.random() * 5, // you can replace this with real geo logic later
          rating: Math.floor(Math.random() * 5) + 1, // mock rating, replace with real data when ready
          availableUntil: product.inventory.expirationDate,
          quantity: product.inventory.quantity,
        }));
        setItems(transformed);
        console.log(transformed);
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

  // Filter items based on category and search query
  // const filteredItems = transformedItems.filter((item) => {
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

  // Sort items based on selected sort option
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
      {/* Header Section */}
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

      {/* Main Content */}
      {/* <div className={isMobile ? "px-4" : "px-8"}>
        <div className="max-w-[1600px] mx-auto">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedItems.map((item) => (
              <FoodItemCard
                key={item.id}
                {...item}
                distance={`${item.distance} km`}
              />
            ))}
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className={cn(isMobile ? "px-4" : "px-8", "pb-4")}>
        <div className="max-w-[1600px] mx-auto">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* {sortedItems.map((item) => (
              <FoodItemCard
                key={item.id}
                {...item}
                distance={`${item.distance} km`}
              />  
            ))} */}
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
                onReservationComplete={async () => {
                  const response = await fetch("/api/products");
                  const data = await response.json();
                  const transformed = data.products.map((product: any) => ({
                    id: product._id,
                    name: product.name,
                    shop: product.storeId || "Unknown Store",
                    type: product.category,
                    category: product.category,
                    originalPrice: product.originalPrice,
                    discountedPrice: product.discountedPrice,
                    image: product.imageUrl,
                    distance: Math.random() * 5,
                    rating: Math.floor(Math.random() * 5) + 1,
                    availableUntil: product.inventory.expirationDate,
                    quantity: product.inventory.quantity,
                  }));
                  setItems(transformed);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
