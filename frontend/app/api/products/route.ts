// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Received product data:", data);

    // Helper to validate a single product payload
    const validateProduct = (product: any): boolean => {
      const {
        SKU,
        imageUrl,
        name,
        description,
        originalPrice,
        discountedPrice,
        quantity,
        category,
        userID,
        expirationDate,
      } = product;
      if (
        !SKU ||
        !imageUrl ||
        !name ||
        !description ||
        originalPrice === undefined ||
        discountedPrice === undefined ||
        !quantity ||
        !category ||
        !userID ||
        !expirationDate
      ) {
        return false;
      }
      return true;
    };

    // Prepare an array of documents to insert.
    let docs: any[] = [];
    if (Array.isArray(data)) {
      for (const product of data) {
        if (!validateProduct(product)) {
          return NextResponse.json(
            { error: "Missing required fields in one or more products" },
            { status: 400 }
          );
        }
        docs.push({
          SKU: product.SKU,
          imageUrl: product.imageUrl,
          name: product.name,
          description: product.description,
          originalPrice: product.originalPrice,
          discountedPrice: product.discountedPrice,
          category: product.category,
          userID: product.userID,
          inventory: {
            quantity: product.quantity,
            expirationDate: product.expirationDate,
          },
          createdAt: new Date(),
        });
      }
    } else {
      // Handle a single product object.
      if (!validateProduct(data)) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
      docs.push({
        SKU: data.SKU,
        imageUrl: data.imageUrl,
        name: data.name,
        description: data.description,
        originalPrice: data.originalPrice,
        discountedPrice: data.discountedPrice,
        category: data.category,
        userID: data.userID,
        inventory: {
          quantity: data.quantity,
          expirationDate: data.expirationDate,
        },
        createdAt: new Date(),
      });
    }

    // Get the database instance using your getDatabase helper.
    const db = await getDatabase();
    const productsCollection = db.collection("products");

    // Insert documents: use insertMany if multiple, else insertOne.
    let insertResult;
    if (docs.length > 1) {
      insertResult = await productsCollection.insertMany(docs);
      if (insertResult.insertedCount > 0) {
        return NextResponse.json({
          message: "Products created successfully!",
          ids: insertResult.insertedIds,
        });
      }
    } else {
      insertResult = await productsCollection.insertOne(docs[0]);
      if (insertResult.insertedId) {
        return NextResponse.json({
          message: "Product created successfully!",
          id: insertResult.insertedId,
        });
      }
    }

    return NextResponse.json({ error: "Product creation failed" }, { status: 500 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}