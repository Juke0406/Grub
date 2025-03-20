import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Helper function to generate a random SKU
function generateSKU() {
  return `SKU${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")}`;
}

// Initial batch of mock products
const mockProducts = [
  {
    name: "Fresh Organic Apples",
    description: "Sweet and crisp organic apples from local farms",
    originalPrice: 5.99,
    discountedPrice: 4.49,
    category: "produce",
    imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
    inventory: {
      quantity: Math.floor(Math.random() * 50) + 10,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  },
  {
    name: "Whole Grain Bread",
    description: "Freshly baked whole grain bread",
    originalPrice: 4.99,
    discountedPrice: 3.99,
    category: "bread",
    imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73",
    inventory: {
      quantity: Math.floor(Math.random() * 30) + 5,
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    },
  },
  {
    name: "Free-Range Eggs",
    description: "Farm fresh free-range eggs",
    originalPrice: 6.99,
    discountedPrice: 5.99,
    category: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1506976785307-8732e854ad03",
    inventory: {
      quantity: Math.floor(Math.random() * 40) + 20,
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    },
  },
  {
    name: "Organic Milk",
    description: "Fresh organic whole milk",
    originalPrice: 4.99,
    discountedPrice: 4.49,
    category: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b",
    inventory: {
      quantity: Math.floor(Math.random() * 25) + 10,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Fresh Carrots",
    description: "Organic farm fresh carrots",
    originalPrice: 3.99,
    discountedPrice: 2.99,
    category: "produce",
    imageUrl: "https://images.unsplash.com/photo-1447175008436-054170c2e979",
    inventory: {
      quantity: Math.floor(Math.random() * 45) + 15,
      expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Atlantic Salmon",
    description: "Fresh premium Atlantic salmon fillet",
    originalPrice: 24.99,
    discountedPrice: 19.99,
    category: "meat",
    imageUrl: "https://images.unsplash.com/photo-1675870793017-9864964f7784",
    inventory: {
      quantity: Math.floor(Math.random() * 20) + 5,
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Greek Yogurt",
    description: "Creamy authentic Greek yogurt",
    originalPrice: 5.99,
    discountedPrice: 4.99,
    category: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777",
    inventory: {
      quantity: Math.floor(Math.random() * 35) + 10,
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Chicken Breast",
    description: "Premium boneless skinless chicken breast",
    originalPrice: 12.99,
    discountedPrice: 9.99,
    category: "meat",
    imageUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791",
    inventory: {
      quantity: Math.floor(Math.random() * 30) + 10,
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Avocado",
    description: "Ripe Hass avocados",
    originalPrice: 2.99,
    discountedPrice: 2.49,
    category: "produce",
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578",
    inventory: {
      quantity: Math.floor(Math.random() * 40) + 20,
      expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Sourdough Bread",
    description: "Artisanal sourdough bread, freshly baked",
    originalPrice: 7.99,
    discountedPrice: 6.49,
    category: "bread",
    imageUrl: "https://images.unsplash.com/photo-1620921592619-652411a0d01a",
    inventory: {
      quantity: Math.floor(Math.random() * 25) + 5,
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Bell Peppers",
    description: "Mixed organic bell peppers",
    originalPrice: 4.99,
    discountedPrice: 3.99,
    category: "produce",
    imageUrl: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83",
    inventory: {
      quantity: Math.floor(Math.random() * 35) + 15,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Orange Juice",
    description: "Freshly squeezed organic orange juice",
    originalPrice: 6.99,
    discountedPrice: 5.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
    inventory: {
      quantity: Math.floor(Math.random() * 30) + 10,
      expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Mixed Nuts",
    description: "Premium roasted mixed nuts",
    originalPrice: 9.99,
    discountedPrice: 8.49,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1542990253-a781e04c0082",
    inventory: {
      quantity: Math.floor(Math.random() * 40) + 20,
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Ground Coffee",
    description: "Artisanal medium roast coffee beans",
    originalPrice: 14.99,
    discountedPrice: 12.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1559525839-b184a4d698c7",
    inventory: {
      quantity: Math.floor(Math.random() * 35) + 15,
      expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Potato Chips",
    description: "Crispy sea salt potato chips",
    originalPrice: 3.99,
    discountedPrice: 2.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b",
    inventory: {
      quantity: Math.floor(Math.random() * 50) + 20,
      expirationDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Tomatoes",
    description: "Vine-ripened organic tomatoes",
    originalPrice: 4.49,
    discountedPrice: 3.99,
    category: "produce",
    imageUrl: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337",
    inventory: {
      quantity: Math.floor(Math.random() * 40) + 10,
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Ground Beef",
    description: "Premium grass-fed ground beef",
    originalPrice: 9.99,
    discountedPrice: 8.99,
    category: "meat",
    imageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678",
    inventory: {
      quantity: Math.floor(Math.random() * 25) + 10,
      expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Cheddar Cheese",
    description: "Aged sharp cheddar cheese",
    originalPrice: 7.99,
    discountedPrice: 6.99,
    category: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d",
    inventory: {
      quantity: Math.floor(Math.random() * 30) + 15,
      expirationDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Green Tea",
    description: "Organic Japanese green tea",
    originalPrice: 8.99,
    discountedPrice: 7.49,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5",
    inventory: {
      quantity: Math.floor(Math.random() * 40) + 20,
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Bananas",
    description: "Fresh organic bananas",
    originalPrice: 2.99,
    discountedPrice: 2.49,
    category: "produce",
    imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224",
    inventory: {
      quantity: Math.floor(Math.random() * 50) + 25,
      expirationDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Chocolate Cookies",
    description: "Classic chocolate chip cookies",
    originalPrice: 4.99,
    discountedPrice: 3.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e",
    inventory: {
      quantity: Math.floor(Math.random() * 45) + 15,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Ice Cream",
    description: "Premium vanilla bean ice cream",
    originalPrice: 6.99,
    discountedPrice: 5.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
    inventory: {
      quantity: Math.floor(Math.random() * 30) + 10,
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Sushi Roll Pack",
    description: "Fresh assorted sushi rolls",
    originalPrice: 15.99,
    discountedPrice: 13.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56",
    inventory: {
      quantity: Math.floor(Math.random() * 20) + 5,
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Granola",
    description: "Homemade crunchy granola mix",
    originalPrice: 8.99,
    discountedPrice: 7.49,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1622542086073-dcdc3350cc2b",
    inventory: {
      quantity: Math.floor(Math.random() * 40) + 10,
      expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Frozen Pizza",
    description: "Stone-baked Margherita pizza",
    originalPrice: 8.99,
    discountedPrice: 6.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    inventory: {
      quantity: Math.floor(Math.random() * 35) + 15,
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Kombucha",
    description: "Organic ginger kombucha",
    originalPrice: 4.99,
    discountedPrice: 3.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8",
    inventory: {
      quantity: Math.floor(Math.random() * 40) + 20,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Fresh Basil",
    description: "Organic fresh basil bunch",
    originalPrice: 2.99,
    discountedPrice: 2.49,
    category: "produce",
    imageUrl: "https://images.unsplash.com/photo-1538596313828-41d729090199",
    inventory: {
      quantity: Math.floor(Math.random() * 30) + 10,
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Honey",
    description: "Raw organic wildflower honey",
    originalPrice: 9.99,
    discountedPrice: 8.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38",
    inventory: {
      quantity: Math.floor(Math.random() * 25) + 15,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Quinoa",
    description: "Organic white quinoa",
    originalPrice: 7.99,
    discountedPrice: 6.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    inventory: {
      quantity: Math.floor(Math.random() * 40) + 20,
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Croissant",
    description: "Buttery and flaky French croissant",
    originalPrice: 3.99,
    discountedPrice: 2.99,
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a",
    inventory: {
      quantity: Math.floor(Math.random() * 30) + 15,
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Danish Pastry",
    description: "Sweet and creamy Danish pastry",
    originalPrice: 4.99,
    discountedPrice: 3.99,
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1509365465985-25d11c17e812",
    inventory: {
      quantity: Math.floor(Math.random() * 25) + 10,
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Pork Chops",
    description: "Premium cut bone-in pork chops",
    originalPrice: 14.99,
    discountedPrice: 12.99,
    category: "meat",
    imageUrl: "https://images.unsplash.com/photo-1432139555190-58524dae6a55",
    inventory: {
      quantity: Math.floor(Math.random() * 20) + 10,
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Mozzarella",
    description: "Fresh Italian mozzarella cheese",
    originalPrice: 6.99,
    discountedPrice: 5.99,
    category: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1589881133595-a3c085cb731d",
    inventory: {
      quantity: Math.floor(Math.random() * 35) + 15,
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Broccoli",
    description: "Fresh organic broccoli crown",
    originalPrice: 3.49,
    discountedPrice: 2.99,
    category: "produce",
    imageUrl: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc",
    inventory: {
      quantity: Math.floor(Math.random() * 40) + 20,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Chocolate Muffin",
    description: "Rich double chocolate muffin",
    originalPrice: 3.99,
    discountedPrice: 2.99,
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa",
    inventory: {
      quantity: Math.floor(Math.random() * 30) + 15,
      expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Turkey Breast",
    description: "Sliced turkey breast meat",
    originalPrice: 11.99,
    discountedPrice: 9.99,
    category: "meat",
    imageUrl: "https://images.unsplash.com/photo-1606728035253-49e8a23146de",
    inventory: {
      quantity: Math.floor(Math.random() * 25) + 10,
      expirationDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Cottage Cheese",
    description: "Low-fat cottage cheese",
    originalPrice: 4.99,
    discountedPrice: 3.99,
    category: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1589881133825-bbb3b9471b1b",
    inventory: {
      quantity: Math.floor(Math.random() * 30) + 15,
      expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Spinach",
    description: "Fresh baby spinach leaves",
    originalPrice: 3.99,
    discountedPrice: 2.99,
    category: "produce",
    imageUrl: "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5",
    inventory: {
      quantity: Math.floor(Math.random() * 35) + 20,
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Cinnamon Roll",
    description: "Fresh baked cinnamon roll with frosting",
    originalPrice: 4.49,
    discountedPrice: 3.49,
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1593872570467-f7491ce2a52e",
    inventory: {
      quantity: Math.floor(Math.random() * 25) + 15,
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Rye Bread",
    description: "Traditional German rye bread",
    originalPrice: 5.99,
    discountedPrice: 4.99,
    category: "bread",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    inventory: {
      quantity: Math.floor(Math.random() * 20) + 10,
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Lamb Chops",
    description: "Premium New Zealand lamb chops",
    originalPrice: 19.99,
    discountedPrice: 17.99,
    category: "meat",
    imageUrl: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143",
    inventory: {
      quantity: Math.floor(Math.random() * 15) + 10,
      expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Heavy Cream",
    description: "Fresh heavy whipping cream",
    originalPrice: 5.99,
    discountedPrice: 4.99,
    category: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1",
    inventory: {
      quantity: Math.floor(Math.random() * 30) + 15,
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Cucumber",
    description: "Fresh organic cucumber",
    originalPrice: 1.99,
    discountedPrice: 1.49,
    category: "produce",
    imageUrl: "https://images.unsplash.com/photo-1568584711271-6c929fb49b60",
    inventory: {
      quantity: Math.floor(Math.random() * 40) + 20,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Bagel",
    description: "New York style plain bagel",
    originalPrice: 2.49,
    discountedPrice: 1.99,
    category: "bread",
    imageUrl: "https://images.unsplash.com/photo-1585445490387-f47934b73b54",
    inventory: {
      quantity: Math.floor(Math.random() * 35) + 15,
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Apple Strudel",
    description: "Traditional Austrian apple strudel",
    originalPrice: 5.99,
    discountedPrice: 4.99,
    category: "pastries",
    imageUrl: "https://images.unsplash.com/photo-1657313938000-23c4322dbe22",
    inventory: {
      quantity: Math.floor(Math.random() * 25) + 10,
      expirationDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Duck Breast",
    description: "Premium Peking duck breast",
    originalPrice: 16.99,
    discountedPrice: 14.99,
    category: "meat",
    imageUrl: "https://images.unsplash.com/photo-1580554530778-ca36943938b2",
    inventory: {
      quantity: Math.floor(Math.random() * 20) + 10,
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Gouda Cheese",
    description: "Aged Dutch Gouda cheese",
    originalPrice: 8.99,
    discountedPrice: 7.99,
    category: "dairy",
    imageUrl: "https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b",
    inventory: {
      quantity: Math.floor(Math.random() * 25) + 15,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Cauliflower",
    description: "Fresh organic cauliflower",
    originalPrice: 4.49,
    discountedPrice: 3.99,
    category: "produce",
    imageUrl: "https://images.unsplash.com/photo-1566842600175-97dca489844f",
    inventory: {
      quantity: Math.floor(Math.random() * 30) + 15,
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Olive Oil",
    description: "Extra virgin olive oil",
    originalPrice: 12.99,
    discountedPrice: 10.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5",
    inventory: {
      quantity: Math.floor(Math.random() * 40) + 20,
      expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
  },
  {
    name: "Balsamic Vinegar",
    description: "Aged balsamic vinegar of Modena",
    originalPrice: 9.99,
    discountedPrice: 8.99,
    category: "others",
    imageUrl: "https://images.unsplash.com/photo-1631292784640-2b24be784d5d",
    inventory: {
      quantity: Math.floor(Math.random() * 35) + 15,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Find user's store
    const db = await getDatabase();
    const store = await db.collection("stores").findOne({ ownerId: userId });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const productsCollection = db.collection("products");
    const productsToInsert = mockProducts.map((product) => ({
      ...product,
      SKU: generateSKU(),
      storeId: store._id.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await productsCollection.insertMany(productsToInsert);

    return NextResponse.json({
      message: "Mock products created successfully!",
      count: result.insertedCount,
    });
  } catch (error) {
    console.error("Error seeding products:", error);
    return NextResponse.json(
      { error: "Failed to seed products" },
      { status: 500 }
    );
  }
}
