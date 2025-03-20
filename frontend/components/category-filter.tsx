"use client";

import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import {
  ChefHat,
  CircleHelp,
  Cookie,
  LayoutGrid,
  Milk,
  Pizza,
  Wheat,
} from "lucide-react";

export const PRODUCT_CATEGORIES = [
  { id: "all", name: "All Products", icon: <LayoutGrid className="h-4 w-4" /> },
  { id: "bread", name: "Bread", icon: <Wheat className="h-4 w-4" /> },
  { id: "pastries", name: "Pastries", icon: <Cookie className="h-4 w-4" /> },
  { id: "meat", name: "Meat", icon: <ChefHat className="h-4 w-4" /> },
  { id: "dairy", name: "Dairy", icon: <Milk className="h-4 w-4" /> },
  { id: "produce", name: "Produce", icon: <Pizza className="h-4 w-4" /> },
  { id: "others", name: "Others", icon: <CircleHelp className="h-4 w-4" /> },
];

interface Category {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

interface CategoryFilterProps {
  categories?: Category[];
  activeCategory?: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilter({
  categories = PRODUCT_CATEGORIES,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const isMobile = useMobile();

  return (
    <div className="max-w-[1600px] mx-auto backdrop-blur-sm">
      <div
        className={`flex gap-3 overflow-x-auto py-3 no-scrollbar ${
          isMobile ? "" : "px-2"
        }`}
      >
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            className={`
              group relative whitespace-nowrap rounded-xl px-5 min-w-fit h-10
              transition-all duration-300 font-medium
              ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg"
                  : "border-gray-200/80 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
              }
              ${isMobile ? "text-sm" : "text-[13px] tracking-wide"}
            `}
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="flex items-center gap-2">
              {category.icon}
              {category.name}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}
