// /*
// The several use case in the main application for API keys
// API can be communicated with on http://localhost:3000/api/api-key
// 1. Listing of all API keys for a particular user
// 2. Creation of a new API key for a particular user (possible to have multiple keys per user, expiry date can be set)
// 3. Deletion of an existing API key
// 4. Updating the usage count for a given API key (mainly used by the side application)

// The side application will directly call the products API to pass it a json list of sample grocery products that are expiring soon.
// */

import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import crypto from "crypto";

// The GET request handler returns all API keys or the keys for a specific user or a list of ALL keys
// Usage: GET /api/api-key?userId=user-123
// Returns: [{ key: "abc123", userId: "user-123", expiresAt: "2022-01-01T00:00:00.000Z", usageCount: 0 }]
// Usage: GET /api/api-key
// Returns: All API keys as JSON
export async function GET(req: Request) {
  const db = await getDatabase();
  if (!db)
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const filter = userId ? { userId } : {}; // Filter by userId if provided
  const apiKeys = await db.collection("api_keys").find(filter).toArray();

  return NextResponse.json(apiKeys);
}

// The POST request handler creates a new API key for a given user
// Usage:
// fetch("/api/api-key", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     userId: "user-123",
//     expiresAt: "2024-04-10T23:59:59.000Z", // Custom expiry date (ISO format)
//   }),
// })
//   .then((res) => res.json())
//   .then((data) => console.log("New API Key:", data));
// Note: if no expiry date is provided, the key will expire in 30 days
export async function POST(req: Request) {
  try {
    const db = await getDatabase();
    if (!db)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );

    const { userId, expiresAt } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const apiKey = crypto.randomBytes(32).toString("hex");

    const newKey = {
      key: apiKey,
      userId,
      expiresAt: expiresAt
        ? new Date(expiresAt)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      usageCount: 0,
      created_at: new Date(), // Mongo recommended pattern!
    };

    const result = await db.collection("api_keys").insertOne(newKey);

    return NextResponse.json({
      key:apiKey,
      expiresAt: newKey.expiresAt,
      id: result.insertedId,
      message: "API key created",
      usageCount: newKey.usageCount,
      created_at: newKey.created_at,
      
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// The PATCH request handler updates the usage count for a given API key
// It is mainly used by the side application to update usage count for a given key
// By providing a valid API key, the usage count will be incremented by 1
export async function PATCH(req: Request) {
  try {
    const db = await getDatabase();
    if (!db)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );

    const { key } = await req.json();

    if (!key) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    // Check if the key exists before attempting an update
    const apiKey = await db.collection("api_keys").findOne({ key });

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    const updateResult = await db
      .collection("api_keys")
      .updateOne({ key }, { $inc: { usageCount: 1 } });

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update API key usage" },
        { status: 500 }
      );
    }

    const updatedKey = await db.collection("api_keys").findOne({ key });

    if (!updatedKey) {
      return NextResponse.json(
        { error: "Failed to retrieve updated API key" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "API key usage updated",
      usageCount: updatedKey.usageCount,
    });
  } catch (error) {
    console.log("Error updating API key:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// The DELETE request handler removes an API key from the list
// Usage:
// fetch("/api/api-key", {
//   method: "DELETE",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ key: "abc123" }),
// })
//   .then((res) => res.json())
//   .then((data) => console.log("API Key Deleted:", data));
// Note: If the key is not found, a 404 error will be returned
export async function DELETE(req: Request) {
  try {
    const db = await getDatabase();
    if (!db)
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );

    const { key } = await req.json();

    if (!key) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    const result = await db.collection("api_keys").deleteOne({ key });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "API key deleted" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
