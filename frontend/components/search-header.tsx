"use client";

import { Input } from "@/components/ui/input";
import { useMobile } from "@/hooks/use-mobile";
import { Search } from "lucide-react";
import React, { useState } from "react";
import { CategoryFilter } from "./category-filter";

interface SearchHeaderProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  showFilters?: boolean;
  categories?: Array<{
    id: string;
    name: string;
    icon?: React.ReactNode;
  }>;
  activeCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

export function SearchHeader({
  placeholder = "Search...",
  onSearch,
  showFilters = true,
  categories,
  activeCategory,
  onCategoryChange,
}: SearchHeaderProps) {
  const isMobile = useMobile();
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg rounded-t-xl">
      <div className={isMobile ? "p-4" : "py-6 px-8"}>
        <div className="max-w-[1600px] mx-auto space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/70 h-[18px] w-[18px] transition-colors group-hover:text-primary" />
              <Input
                placeholder={placeholder}
                className="pl-12 pr-4 h-12 rounded-2xl bg-gray-50/80 hover:bg-gray-50 focus:bg-white w-full border border-gray-200/80 hover:border-gray-300 transition-all duration-300 shadow-sm"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          {showFilters &&
            showCategoryFilter &&
            categories &&
            onCategoryChange && (
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory || "all"}
                onCategoryChange={onCategoryChange}
              />
            )}
        </div>
      </div>
    </div>
  );
}
