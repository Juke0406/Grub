"use client";

import { SearchHeader } from "@/components/search-header";
import { Spinner } from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ImageIcon, MapPin, Navigation, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

function formatStoreHours(time: string) {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface Store {
  _id: string;
  name: string;
  type: string;
  location: {
    address: string;
  };
  image?: string;
  rating?: number;
  distance: number;
  storeHoursToday: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

interface StorePaginationResponse {
  stores: Store[];
  pagination: {
    page: number;
    pages: number;
    totalItems: number;
  };
}

interface StoreListingProps {
  type: string;
  categories: Category[];
  placeholder: string;
  baseUrl: string;
}

export function StoreListing({
  type,
  categories,
  placeholder,
  baseUrl,
}: StoreListingProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const observer = useRef<IntersectionObserver | null>(null);

  const lastStoreRef = useCallback(
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

  const fetchStores = useCallback(
    async (pageNum: number) => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          type,
          page: pageNum.toString(),
          limit: "12",
        });

        if (searchValue) {
          params.append("search", searchValue);
        }

        const response = await fetch(`/api/stores/list?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch stores");
        }

        const data: StorePaginationResponse = await response.json();

        if (pageNum === 1) {
          setStores(data.stores);
        } else {
          setStores((prev) => [...prev, ...data.stores]);
        }

        setHasMore(data.pagination.page < data.pagination.pages);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [type, searchValue]
  );

  useEffect(() => {
    setStores([]);
    setPage(1);
    setHasMore(true);
    fetchStores(1);
  }, [fetchStores, activeCategory, searchValue]);

  useEffect(() => {
    if (page > 1) {
      fetchStores(page);
    }
  }, [page, fetchStores]);

  const isInitialLoading = isLoading && stores.length === 0;

  return (
    <div className="min-h-screen">
      <SearchHeader
        onSearch={setSearchValue}
        placeholder={placeholder}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <div className="max-w-[1600px] mx-auto py-4">
        {isInitialLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8" />
          </div>
        ) : stores.length === 0 ? (
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
              No stores found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store, index) => (
              <div
                key={store._id}
                ref={index === stores.length - 1 ? lastStoreRef : null}
              >
                <Link href={`/browse/${store.type.toLowerCase()}/${store._id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow !p-0 flex flex-col gap-0">
                    <div className="relative h-48">
                      {store.image ? (
                        <Image
                          src={store.image}
                          alt={store.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{store.name}</h3>
                        {store.rating && (
                          <Badge variant="secondary">
                            ⭐ {store.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{store.location.address}</span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-600">
                            <Navigation className="w-4 h-4" />
                            <span>{store.distance.toFixed(1)} km</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          <span
                            className={
                              store.storeHoursToday.isOpen
                                ? "text-green-600"
                                : "text-red-500"
                            }
                          >
                            {store.storeHoursToday.isOpen ? "Open" : "Closed"} ·{" "}
                            {formatStoreHours(store.storeHoursToday.open)} -{" "}
                            {formatStoreHours(store.storeHoursToday.close)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
        {isLoading && stores.length > 0 && (
          <div className="flex justify-center py-4">
            <Spinner className="h-8 w-8" />
          </div>
        )}
      </div>
    </div>
  );
}
