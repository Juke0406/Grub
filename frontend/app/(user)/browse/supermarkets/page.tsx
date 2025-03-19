"use client";

import { StoreListing } from "@/components/store-listing";
import { Apple, Beef, Carrot, ShoppingBag } from "lucide-react";

const categories = [
  { id: "all", name: "All", icon: <ShoppingBag className="h-4 w-4" /> },
  { id: "produce", name: "Produce", icon: <Carrot className="h-4 w-4" /> },
  { id: "dairy", name: "Dairy", icon: <Apple className="h-4 w-4" /> },
  { id: "meat", name: "Meat", icon: <Beef className="h-4 w-4" /> },
];

export default function SupermarketsPage() {
  return (
    <StoreListing
      type="SUPERMARKET"
      categories={categories}
      placeholder="Search supermarkets..."
      baseUrl="/browse/supermarkets"
    />
  );
}
