"use client";

import { FoodItemCard } from "@/components/food-item-card";
import { SearchHeader } from "@/components/search-header";
import { Spinner } from "@/components/spinner";
import { StoreHeader } from "@/components/store-header";
import { Button } from "@/components/ui/button";
import { Store } from "@/types/store";
import { Apple, ArrowLeft, Beef, Carrot, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const categories = [
  { id: "all", name: "All", icon: <ShoppingBag className="h-4 w-4" /> },
  { id: "produce", name: "Produce", icon: <Carrot className="h-4 w-4" /> },
  { id: "dairy", name: "Dairy", icon: <Apple className="h-4 w-4" /> },
  { id: "meat", name: "Meat", icon: <Beef className="h-4 w-4" /> },
];

interface StoreDetails {
  store: Store & {
    rating?: number;
    distance?: number;
  };
  products: {
    _id: string;
    name: string;
    shop: string;
    originalPrice: number;
    discountedPrice: number;
    image: string;
    availableUntil: string;
    quantity: number;
    storeAddress: string;
    storeHoursToday: {
      open: string;
      close: string;
      isOpen: boolean;
    };
    distance: number;
  }[];
}

export default function StorePage({
  params,
}: {
  params: { id: string; type: string };
}) {
  const [store, setStore] = useState<StoreDetails["store"] | null>(null);
  const [products, setProducts] = useState<StoreDetails["products"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const observer = useRef<IntersectionObserver | null>(null);

  const fetchStoreData = useCallback(
    async (pageNum: number, resetProducts = false) => {
      try {
        const searchParams = new URLSearchParams({
          page: pageNum.toString(),
          limit: "12",
        });

        if (searchValue) {
          searchParams.append("search", searchValue);
        }

        if (activeCategory !== "all") {
          searchParams.append("category", activeCategory);
        }

        const response = await fetch(
          `/api/stores/${params.id}?${searchParams.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch store data");
        }
        const data = await response.json();
        console.log("Store page data:", data);

        // Add random rating and distance for display purposes
        const storeWithRating = {
          ...data.store,
          rating: Math.floor(Math.random() * 5) + 1,
          distance: Math.random() * 5,
        };

        const formattedProducts = data.products.map((product: any) => ({
          _id: product._id,
          name: product.name,
          shop: data.store.name,
          originalPrice: product.originalPrice,
          discountedPrice: product.discountedPrice,
          image: product.imageUrl,
          availableUntil: product.inventory.expirationDate,
          quantity: product.inventory.quantity,
          storeAddress: data.store.location.address,
          storeHoursToday: {
            open: data.store.businessHours[0].open,
            close: data.store.businessHours[0].close,
            isOpen: data.store.businessHours[0].isOpen,
          },
          distance: Math.random() * 5,
        }));

        if (pageNum === 1 || resetProducts) {
          setStore(storeWithRating);
          setProducts(formattedProducts);
        } else {
          setProducts((prev) => [...prev, ...formattedProducts]);
        }

        setHasMore(data.pagination.page < data.pagination.pages);
      } catch (error) {
        console.error("Error fetching store data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [params.id, searchValue, activeCategory]
  );

  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore]
  );

  useEffect(() => {
    fetchStoreData(1);
  }, [fetchStoreData]);

  useEffect(() => {
    if (page > 1) {
      setIsLoadingMore(true);
      fetchStoreData(page).finally(() => setIsLoadingMore(false));
    }
  }, [page, fetchStoreData]);

  // Reset pagination when search or category changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchStoreData(1, true);
  }, [searchValue, activeCategory]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold">Store not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4">
        <Link href={`/browse/${params.type.toLowerCase()}s`}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to{" "}
            {params.type === "SUPERMARKET" ? "Supermarkets" : "Bakeries"}
          </Button>
        </Link>
      </div>
      <StoreHeader store={store} />

      <div className="mt-8">
        <SearchHeader
          onSearch={setSearchValue}
          placeholder="Search items..."
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items available</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
            {products.map((product, index) => (
              <div
                key={product._id}
                ref={index === products.length - 1 ? lastProductRef : null}
              >
                <FoodItemCard
                  id={product._id}
                  name={product.name}
                  shop={store.name}
                  originalPrice={product.originalPrice}
                  discountedPrice={product.discountedPrice}
                  image={product.image}
                  availableUntil={product.availableUntil}
                  quantity={product.quantity}
                  storeAddress={store.location.address}
                  storeHoursToday={{
                    open: store.businessHours[0].open,
                    close: store.businessHours[0].close,
                    isOpen: store.businessHours[0].isOpen,
                  }}
                  distance={store.distance || 0}
                  onReservationComplete={() => fetchStoreData(1, true)}
                />
              </div>
            ))}
          </div>
        )}
        {isLoadingMore && (
          <div className="flex justify-center py-4 pt-10">
            <Spinner className="h-8 w-8" />
          </div>
        )}
      </div>
    </div>
  );
}
