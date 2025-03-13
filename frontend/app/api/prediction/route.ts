// app/api/predictions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    // Get the database using your helper function.
    const db = await getDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }
    
    const productsCollection = db.collection("products");

    // Fetch all products.
    const products = await productsCollection.find({}).toArray();

    // Define a base threshold value.
    // In a real-world scenario, you might compute this dynamically.
    const threshold = 10;

    // Build predictions based on current inventory levels.
    const predictions = products.reduce((acc: any[], product) => {
      const currentQuantity = product.inventory?.quantity || 0;
      if (currentQuantity > threshold) {
        // Calculate the excess amount over the threshold.
        const excess = currentQuantity - threshold;
        // Compute a simple reduction percentage as an example:
        const reductionPercent = Math.min(100, Math.round((excess / currentQuantity) * 100));
        acc.push({
          SKU: product.SKU,
          name: product.name,
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