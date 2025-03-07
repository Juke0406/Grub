"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMobile } from "@/hooks/use-mobile";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { CategoryFilter } from "./category-filter";

type SortOption = "nearest" | "bestDeals" | "rating";

interface SearchHeaderProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  showFilters?: boolean;
  onSort?: (option: SortOption) => void;
  sortBy?: SortOption;
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
  onSort,
  sortBy = "nearest",
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
            {showFilters && (
              <Button
                variant="outline"
                size="icon"
                className={`h-12 w-12 shrink-0 rounded-xl border-gray-200/80 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm ${
                  showCategoryFilter ? "bg-gray-50 border-gray-300" : ""
                }`}
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              >
                <SlidersHorizontal className="h-5 w-5 text-muted-foreground/70" />
              </Button>
            )}
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

          {/* Sort Bar */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground/70">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Sort by:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={sortBy === "nearest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSort?.("nearest")}
                  className={`rounded-lg h-9 px-4 font-medium transition-all duration-300 shadow-sm
                    ${
                      sortBy === "nearest"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        : "border-gray-200/80 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  Nearest
                </Button>
                <Button
                  variant={sortBy === "bestDeals" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSort?.("bestDeals")}
                  className={`rounded-lg h-9 px-4 font-medium transition-all duration-300 shadow-sm
                    ${
                      sortBy === "bestDeals"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        : "border-gray-200/80 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  Best Deals
                </Button>
                <Button
                  variant={sortBy === "rating" ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSort?.("rating")}
                  className={`rounded-lg h-9 px-4 font-medium transition-all duration-300 shadow-sm
                    ${
                      sortBy === "rating"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        : "border-gray-200/80 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  Rating
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
