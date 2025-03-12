import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Phone } from "lucide-react";

interface SupermarketParams {
  params: {
    id: string;
  };
}

export default function SupermarketPage({ params }: SupermarketParams) {
  // In a real app, fetch supermarket data using params.id
  const mockSupermarket = {
    id: params.id,
    name: "FreshMart Supermarket",
    description:
      "Your neighborhood supermarket for fresh groceries and daily essentials.",
    address: "456 Market Street",
    phone: "+65 6789 0123",
    operatingHours: "8:00 AM - 10:00 PM",
    image:
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop",
    categories: [
      {
        name: "Produce",
        items: [
          {
            id: "1",
            name: "Fresh Vegetables Bundle",
            originalPrice: 15.0,
            discountedPrice: 7.5,
            image:
              "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop",
            expiryDate: "2025-03-09",
          },
          {
            id: "2",
            name: "Fruit Mix Pack",
            originalPrice: 20.0,
            discountedPrice: 10.0,
            image:
              "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop",
            expiryDate: "2025-03-09",
          },
        ],
      },
      {
        name: "Bakery",
        items: [
          {
            id: "3",
            name: "Assorted Bread Bag",
            originalPrice: 12.0,
            discountedPrice: 6.0,
            image:
              "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop",
            expiryDate: "2025-03-09",
          },
        ],
      },
      {
        name: "Dairy",
        items: [
          {
            id: "4",
            name: "Yogurt Pack",
            originalPrice: 10.0,
            discountedPrice: 5.0,
            image:
              "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&auto=format&fit=crop",
            expiryDate: "2025-03-09",
          },
        ],
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
              src={mockSupermarket.image}
              alt={mockSupermarket.name}
              className="w-full h-[300px] object-cover rounded-t-lg"
            />
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">
                {mockSupermarket.name}
              </h1>
              <p className="text-muted-foreground mb-4">
                {mockSupermarket.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{mockSupermarket.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>{mockSupermarket.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{mockSupermarket.operatingHours}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Section */}
      <Tabs
        defaultValue={mockSupermarket.categories[0].name.toLowerCase()}
        className="space-y-4"
      >
        <TabsList>
          {mockSupermarket.categories.map((category) => (
            <TabsTrigger
              key={category.name}
              value={category.name.toLowerCase()}
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {mockSupermarket.categories.map((category) => (
          <TabsContent key={category.name} value={category.name.toLowerCase()}>
            <div className="grid gap-6 md:grid-cols-2">
              {category.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-[200px] object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Best before: {item.expiryDate}
                      </p>
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
