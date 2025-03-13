// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri =
  process.env.DB_CONN_STRING ||
  "mongodb+srv://admin:admin@cluster0.4imvo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true&tlsAllowInvalidHostnames=true";
const dbName = process.env.DATABASE_NAME || "grubDB";
const collectionName = process.env.PRODUCTS_COLLECTION_NAME || "products";

// Cache the MongoDB client between requests
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    });
    await cachedClient.connect();
  } else {
    try {
      await cachedClient.db(dbName).command({ ping: 1 });
    } catch (error) {
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

    // Helper to validate a single product payload
    const validateProduct = (product: any) => {
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

    // Prepare documents to insert
    let docs = [];

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
      // Single product object
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

    const client = await connectToDatabase();
    const db = client.db(dbName);
    const productsCollection = db.collection(collectionName);

    // Insert using insertMany if more than one, else insertOne
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
