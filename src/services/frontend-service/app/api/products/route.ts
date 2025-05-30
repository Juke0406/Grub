// app/api/products/route.ts
import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "../middleware/auth-middleware";

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
    const portal = searchParams.get("portal");

    const db = await getDatabase();

    // Build base query object
    const query: any = {};

    // Only filter by store if in business portal
    if (portal === "business") {
      const store = await db.collection("stores").findOne({ ownerId: userId });
      if (!store) {
        return NextResponse.json({ error: "Store not found" }, { status: 404 });
      }
      query.storeId = store._id.toString();
    }

    // Add filters
    if (category) {
      const categories = category.split(",");
      query.category = { $in: categories };
    }

    const search = searchParams.get("search");
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { storeName: { $regex: search, $options: "i" } },
      ];
    }

    // Execute query with pagination and get store information
    const collection = db.collection("products");
    const products = await collection
      .aggregate([
        { $match: query },
        { $sort: { "inventory.expirationDate": 1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "stores",
            let: { storeId: { $toObjectId: "$storeId" } },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$storeId"] } } },
              { $project: { name: 1, location: 1, hours: 1 } },
            ],
            as: "store",
          },
        },
        {
          $addFields: {
            storeName: { $arrayElemAt: ["$store.name", 0] },
            storeAddress: { $arrayElemAt: ["$store.location.address", 0] },
            storeHoursToday: {
              $let: {
                vars: {
                  dayIndex: {
                    $switch: {
                      branches: [
                        {
                          case: { $eq: [{ $dayOfWeek: new Date() }, 1] },
                          then: 6,
                        }, // Sunday
                        {
                          case: { $eq: [{ $dayOfWeek: new Date() }, 2] },
                          then: 0,
                        }, // Monday
                        {
                          case: { $eq: [{ $dayOfWeek: new Date() }, 3] },
                          then: 1,
                        }, // Tuesday
                        {
                          case: { $eq: [{ $dayOfWeek: new Date() }, 4] },
                          then: 2,
                        }, // Wednesday
                        {
                          case: { $eq: [{ $dayOfWeek: new Date() }, 5] },
                          then: 3,
                        }, // Thursday
                        {
                          case: { $eq: [{ $dayOfWeek: new Date() }, 6] },
                          then: 4,
                        }, // Friday
                        {
                          case: { $eq: [{ $dayOfWeek: new Date() }, 7] },
                          then: 5,
                        }, // Saturday
                      ],
                      default: 0,
                    },
                  },
                },
                in: { $arrayElemAt: ["$store.hours", "$$dayIndex"] },
              },
            },
          },
        },
        {
          $project: {
            store: 0, // Remove the store array since we extracted what we need
          },
        },
      ])
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
    const authResult = await authMiddleware(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { store, type } = authResult;
    const db = await getDatabase();

    // If using API key, update its usage
    if (type === "apiKey") {
      const headersList = await headers();
      const apiKey = headersList.get("x-api-key");
      if (apiKey) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/api-key`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: apiKey }),
        });
      }
    }

    const data = await req.json();

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
    const authResult = await authMiddleware(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { store } = authResult;
    const { productId, quantityReserved } = await request.json();

    if (!productId || !quantityReserved) {
      return NextResponse.json(
        { error: "Missing productId or quantityReserved" },
        { status: 400 }
      );
    }

    const db = await getDatabase();

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
