"use client";

import { CategoryFilter } from "@/components/category-filter";
import { FoodItemCard } from "@/components/food-item-card";
import { SearchHeader } from "@/components/search-header";
import { useMobile } from "@/hooks/use-mobile";
import data from "@/lib/data.json";
import { Beef, Coffee, Pizza, ShoppingBag, Soup } from "lucide-react";
import { useState } from "react";

const categories = [
  { id: "all", name: "All Items", icon: <ShoppingBag className="h-4 w-4" /> },
  {
    id: "mystery",
    name: "Mystery Bags",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  { id: "bread", name: "Bread", icon: <Pizza className="h-4 w-4" /> },
  { id: "pastries", name: "Pastries", icon: <Coffee className="h-4 w-4" /> },
  { id: "produce", name: "Produce", icon: <Soup className="h-4 w-4" /> },
  { id: "meat", name: "Meat", icon: <Beef className="h-4 w-4" /> },
];

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

type SortOption = "nearest" | "bestDeals" | "rating";

export default function BrowseAllPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("nearest");
  const isMobile = useMobile();

  // Filter items based on category and search query
  const filteredItems = transformedItems.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shop.toLowerCase().includes(searchQuery.toLowerCase());
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
          onSort={setSortBy}
          sortBy={sortBy}
        />
        <div className={isMobile ? "px-4" : "px-8 py-2"}>
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={isMobile ? "px-4" : "px-8"}>
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
      </div>
    </div>
  );
}
