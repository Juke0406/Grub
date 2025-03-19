"use client";

import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import React from "react";

interface Category {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory?: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryFilter({
  categories,
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
            {category.icon && (
              <span
                className={`mr-2 transition-transform duration-300 ${
                  activeCategory === category.id
                    ? "text-white"
                    : "text-muted-foreground/70 group-hover:text-primary"
                }`}
              >
                {category.icon}
              </span>
            )}
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
