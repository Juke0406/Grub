// app/api/products/route.ts
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const db = await getDatabase();

    // Find store by ownerId from session
    const store = await db.collection("stores").findOne({ ownerId: userId });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Build query object with store ID
    const query: any = { storeId: store._id.toString() };

    // Add category filter if provided
    if (category) {
      const categories = category.split(",");
      query.category = { $in: categories };
    }

    // Execute query with pagination
    const collection = db.collection("products");
    const products = await collection
      .find(query)
      .sort({ "inventory.expirationDate": 1 }) // Sort by expiration date (soonest first)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await collection.countDocuments(query);

    // Return response
    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    // Find user's store
    const db = await getDatabase();
    const store = await db.collection("stores").findOne({ ownerId: userId });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Validate product data
    const {
      SKU,
      imageUrl,
      name,
      description,
      originalPrice,
      discountedPrice,
      category,
      inventory,
    } = data;

    if (
      !SKU ||
      !imageUrl ||
      !name ||
      !description ||
      originalPrice === undefined ||
      discountedPrice === undefined ||
      !category ||
      !inventory?.quantity ||
      !inventory?.expirationDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create product document
    const doc = {
      SKU,
      imageUrl,
      name,
      description,
      originalPrice,
      discountedPrice,
      category,
      storeId: store._id.toString(),
      inventory,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert document
    const productsCollection = db.collection("products");
    const result = await productsCollection.insertOne(doc);

    if (result.insertedId) {
      return NextResponse.json({
        message: "Product created successfully!",
        id: result.insertedId,
      });
    }

    return NextResponse.json(
      { error: "Product creation failed" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { productId, quantityReserved } = await request.json();

    if (!productId || !quantityReserved) {
      return NextResponse.json(
        { error: "Missing productId or quantityReserved" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Find user's store
    const store = await db.collection("stores").findOne({ ownerId: userId });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const productsCollection = db.collection("products");

    // Check if product exists and belongs to user's store
    const product = await productsCollection.findOne({
      _id: new ObjectId(productId),
      storeId: store._id.toString(),
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or unauthorized" },
        { status: 404 }
      );
    }

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { "inventory.quantity": -quantityReserved } }
    );

    if (result.modifiedCount === 1) {
      return NextResponse.json({ message: "Stock updated successfully" });
    } else {
      return NextResponse.json(
        { error: "Stock update failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating stock:", error);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 }
    );
  }
}
