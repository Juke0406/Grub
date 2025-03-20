"use client";

import { StoreListing } from "@/components/store-listing";
import { Cake, Cookie, ShoppingBag } from "lucide-react";

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

export default function BakeriesPage() {
  return (
    <StoreListing
      type="BAKERY"
      categories={categories}
      placeholder="Search bakeries..."
      baseUrl="/browse/bakeries"
    />
  );
}
