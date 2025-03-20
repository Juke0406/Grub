"use client";

import { CategoryFilter } from "@/components/category-filter";
import { FoodItemCard } from "@/components/food-item-card";
import { SearchHeader } from "@/components/search-header";
import { Spinner } from "@/components/spinner";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface Item {
  id: string;
  name: string;
  shop: string;
  type: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  image: string;
  storeImage: string;
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
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const isMobile = useMobile();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const fetchData = useCallback(
    async (pageNum: number) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "12",
        });

        if (activeCategory !== "all") {
          params.append("category", activeCategory);
        }

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();

        if (!response.ok) {
          console.error("Error fetching products:", data.error);
          return;
        }

        const transformed = await Promise.all(
          data.products.map(async (product: any) => {
            const storeResponse = await fetch(`/api/stores/${product.storeId}`);
            const storeData = await storeResponse.json();

            return {
              id: product._id,
              name: product.name,
              shop: product.storeName || "Unknown Store",
              type: product.category,
              category: product.category,
              originalPrice: product.originalPrice,
              discountedPrice: product.discountedPrice,
              image: product.imageUrl,
              storeImage: storeData.store?.image || product.imageUrl, // Use store image or fallback to product image
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
            };
          })
        );

        if (pageNum === 1) {
          setItems(transformed);
        } else {
          setItems((prevItems) => [...prevItems, ...transformed]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [activeCategory, searchQuery]
  );

  // Reset and fetch when category or search changes
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    fetchData(1);
  }, [fetchData, activeCategory, searchQuery]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchData(page);
    }
  }, [page, fetchData]);

  const sortedItems = [...items].sort((a, b) => {
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

  const isInitialLoading = isLoading && items.length === 0;

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
          {isInitialLoading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-8 w-8" />
            </div>
          ) : sortedItems.length === 0 ? (
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
                {searchQuery || activeCategory !== "all"
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "Check back later for new items."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative">
              {sortedItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  ref={index === sortedItems.length - 1 ? lastItemRef : null}
                >
                  <FoodItemCard
                    id={item.id}
                    name={item.name}
                    shop={item.shop}
                    originalPrice={item.originalPrice}
                    discountedPrice={item.discountedPrice}
                    image={item.image}
                    storeImage={item.storeImage}
                    availableUntil={item.availableUntil}
                    quantity={item.quantity}
                    storeAddress={item.storeAddress}
                    storeHoursToday={item.storeHoursToday}
                    distance={item.distance}
                    onReservationComplete={async () => {
                      setItems([]);
                      setPage(1);
                      setHasMore(true);
                      await fetchData(1);
                    }}
                  />
                </div>
              ))}
              {isLoading && !isInitialLoading && (
                <div className="col-span-full flex justify-center py-4">
                  <Spinner className="h-8 w-8" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
