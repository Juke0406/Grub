import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin, Phone, Star } from "lucide-react";

interface BakeryParams {
  params: {
    id: string;
  };
}

export default function BakeryPage({ params }: BakeryParams) {
  // In a real app, fetch bakery data using params.id
  const mockBakery = {
    id: params.id,
    name: "Artisan Bakery",
    description:
      "Specializing in artisanal breads and pastries made fresh daily.",
    rating: 4.8,
    totalRatings: 256,
    address: "123 Baker Street",
    phone: "+65 9123 4567",
    operatingHours: "7:00 AM - 8:00 PM",
    image:
      "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&auto=format&fit=crop",
    featuredItems: [
      {
        id: "1",
        name: "Sourdough Bread",
        originalPrice: 8.0,
        discountedPrice: 4.0,
        image:
          "https://images.unsplash.com/photo-1555951015-6da899b5c2cd?w=800&auto=format&fit=crop",
      },
      {
        id: "2",
        name: "Croissant Bundle",
        originalPrice: 12.0,
        discountedPrice: 6.0,
        image:
          "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop",
      },
    ],
  };

  return (
    <div className="container max-w-4xl py-6">
      {/* Header Section */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-0">
            <img
              src={mockBakery.image}
              alt={mockBakery.name}
              className="w-full h-[300px] object-cover rounded-t-lg"
            />
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">{mockBakery.name}</h1>
              <p className="text-muted-foreground mb-4">
                {mockBakery.description}
              </p>

              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{mockBakery.rating}</span>
                <span className="text-muted-foreground">
                  ({mockBakery.totalRatings} ratings)
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{mockBakery.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>{mockBakery.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{mockBakery.operatingHours}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Items Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Items</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {mockBakery.featuredItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-[200px] object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{item.name}</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold text-green-600">
                        ${item.discountedPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground line-through">
                        ${item.originalPrice.toFixed(2)}
                      </p>
                    </div>
                    <Button>Reserve</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
