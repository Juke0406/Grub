"use client";

import { SearchHeader } from "@/components/search-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import data from "@/lib/data.json";
import { Cake, Cookie, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function BakeriesPage() {
  const [searchValue, setSearchValue] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "All", icon: <ShoppingBag className="h-4 w-4" /> },
    { id: "bread", name: "Bread", icon: <Cookie className="h-4 w-4" /> },
    { id: "pastry", name: "Pastry", icon: <Cake className="h-4 w-4" /> },
    {
      id: "bundle",
      name: "Bundles",
      icon: <ShoppingBag className="h-4 w-4" />,
    },
  ];

  const filteredBakeries = data.bakeries.filter((bakery) => {
    if (searchValue) {
      return (
        bakery.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        bakery.location.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen">
      <SearchHeader
        onSearch={setSearchValue}
        placeholder="Search bakeries..."
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <div className="max-w-[1600px] mx-auto py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBakeries.map((bakery) => (
            <Link href={`/browse/bakeries/${bakery.id}`} key={bakery.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow !p-0 h-[600px] flex flex-col">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={bakery.image}
                    alt={bakery.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="px-6 pb-3 flex-1 overflow-auto">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{bakery.name}</h3>
                    <Badge variant="secondary">
                      ⭐ {bakery.rating.toFixed(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {bakery.location}
                  </p>
                  <div className="space-y-2">
                    {bakery.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm line-through text-muted-foreground">
                            ${item.originalPrice.toFixed(2)}
                          </p>
                          <p className="font-bold text-primary">
                            ${item.discountedPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
