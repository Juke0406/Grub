"use client";

import { CategoryFilter } from "@/components/category-filter";
import { FoodItemCard } from "@/components/food-item-card";
import { SearchHeader } from "@/components/search-header";
import { useMobile } from "@/hooks/use-mobile";
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

// Mock data - in real app this would come from an API
const mockItems = [
  {
    id: 1,
    name: "Mystery Bread Bag",
    shop: "Happy Bakery",
    type: "bakery",
    category: "mystery",
    originalPrice: 40,
    discountedPrice: 20,
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec",
    distance: 0.8,
    rating: 4.5,
    availableUntil: "Today 9pm",
  },
  {
    id: 2,
    name: "Fresh Produce Bundle",
    shop: "FreshMart",
    type: "supermarket",
    category: "produce",
    originalPrice: 30,
    discountedPrice: 15,
    image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c",
    distance: 1.2,
    rating: 4.8,
    availableUntil: "Today 8pm",
  },
  {
    id: 3,
    name: "Pastry Box",
    shop: "Sweet Delights",
    type: "bakery",
    category: "pastries",
    originalPrice: 35,
    discountedPrice: 17.5,
    image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f",
    distance: 2.1,
    rating: 4.6,
    availableUntil: "Today 8:30pm",
  },
  {
    id: 4,
    name: "Artisan Bread Selection",
    shop: "Happy Bakery",
    type: "bakery",
    category: "bread",
    originalPrice: 25,
    discountedPrice: 12.5,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    distance: 0.8,
    rating: 4.7,
    availableUntil: "Today 7pm",
  },
  {
    id: 5,
    name: "Premium Meat Pack",
    shop: "FreshMart",
    type: "supermarket",
    category: "meat",
    originalPrice: 50,
    discountedPrice: 25,
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f",
    distance: 1.2,
    rating: 4.9,
    availableUntil: "Today 6pm",
  },
  {
    id: 6,
    name: "Mystery Pastry Box",
    shop: "Sweet Delights",
    type: "bakery",
    category: "mystery",
    originalPrice: 45,
    discountedPrice: 22.5,
    image: "https://images.unsplash.com/photo-1517433367423-c7e5b0f35086",
    distance: 2.1,
    rating: 4.4,
    availableUntil: "Today 8pm",
  },
];

type SortOption = "nearest" | "bestDeals" | "rating";

export default function BrowseAllPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("nearest");
  const isMobile = useMobile();

  // Filter items based on category and search query
  const filteredItems = mockItems.filter((item) => {
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
