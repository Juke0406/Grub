import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Clock, MapPin, Tag } from "lucide-react";

interface FoodItemParams {
  params: Promise<{
    id: string;
  }>;
}

export default async function FoodItemPage(props: FoodItemParams) {
  const params = await props.params;
  // In a real app, fetch item data using params.id
  const mockItem = {
    id: params.id,
    name: "Fresh Sourdough Bread",
    originalPrice: 8.0,
    discountedPrice: 4.0,
    description:
      "Artisanal sourdough bread baked fresh daily. Perfect for sandwiches or as a side.",
    businessName: "Artisan Bakery",
    businessType: "Bakery",
    location: "123 Baker Street",
    saleEnds: "2025-03-08T20:00:00",
    pickupPeriod: "17:00-20:00",
    image:
      "https://images.unsplash.com/photo-1555951015-6da899b5c2cd?w=800&auto=format&fit=crop",
  };

  return (
    <div className="container max-w-4xl py-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Image Section */}
        <Card>
          <CardContent className="p-0">
            <img
              src={mockItem.image}
              alt={mockItem.name}
              className="w-full h-[300px] object-cover rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{mockItem.name}</h1>
            <p className="text-muted-foreground">{mockItem.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xl font-semibold text-green-600">
              ${mockItem.discountedPrice.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground line-through">
              Original: ${mockItem.originalPrice.toFixed(2)}
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{mockItem.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              <span>
                Sale ends: {new Date(mockItem.saleEnds).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Pickup time: {mockItem.pickupPeriod}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              <span>{mockItem.businessType}</span>
            </div>
          </div>

          <Button className="w-full" size="lg">
            Reserve Item
          </Button>
        </div>
      </div>
    </div>
  );
}
