// app/api/predictions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const productsCollection = db.collection("products");

    // Fetch all products.
    const products = await productsCollection.find({}).toArray();

    // Define a base threshold.
    const threshold = 10;

    // Build predictions based on current inventory levels.
    const predictions = products.reduce((acc: any[], product) => {
      const currentQuantity = product.inventory?.quantity || 0;
      if (currentQuantity > threshold) {
        const excess = currentQuantity - threshold;
        const reductionPercent = Math.min(100, Math.round((excess / currentQuantity) * 100));
        
        // Format createdAt date for display.
        const createdAtFormatted = product.createdAt 
          ? new Date(product.createdAt).toLocaleDateString()
          : "N/A";

        acc.push({
          _id: product._id instanceof ObjectId ? product._id.toString() : product._id,
          SKU: product.SKU,
          // Combine the product name and its createdAt date.
          name: `${product.name} (${createdAtFormatted})`,
          currentQuantity,
          recommendation: `Reduce import quantity by ${reductionPercent}%`,
        });
      }
      return acc;
    }, []);

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 500 });
  }
}