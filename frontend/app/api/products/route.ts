// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri =
  process.env.DB_CONN_STRING ||
  "mongodb+srv://admin:admin@cluster0.4imvo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true&tlsAllowInvalidHostnames=true";
const dbName = process.env.DB_NAME || "productsDB";
const collectionName = process.env.PRODUCTS_COLLECTION_NAME || "products";

// Cache the MongoDB client between requests
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  // If there's no cached client, create one.
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    });
    await cachedClient.connect();
  } else {
    try {
      // Ping the database to check if the connection is still alive.
      await cachedClient.db(dbName).command({ ping: 1 });
    } catch (error) {
      // If ping fails, reconnect.
      cachedClient = new MongoClient(uri, {
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
      });
      await cachedClient.connect();
    }
  }
  return cachedClient;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log("Received product data:", data);

    // Destructure the new fields from the payload.
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
      expirationDate
    } = data;

    // Validate incoming data.
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
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the product document, embedding inventory details.
    const productDoc = {
      SKU,
      imageUrl,
      name,
      description,
      originalPrice,
      discountedPrice,
      category,
      userID,
      inventory: {
        quantity,
        expirationDate,
      },
      createdAt: new Date(),
    };

    // Connect to MongoDB and get the collection.
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const productsCollection = db.collection(collectionName);

    // Insert the product document.
    const insertResult = await productsCollection.insertOne(productDoc);
    if (insertResult.insertedId) {
      return NextResponse.json({
        message: "Product created successfully!",
        id: insertResult.insertedId,
      });
    } else {
      return NextResponse.json(
        { error: "Product creation failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}