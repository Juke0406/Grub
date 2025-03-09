import { NextResponse } from "next/server";
import crypto from "crypto";

const apiKeys: {
  key: string;
  userId: string;
  expiresAt: Date;
  usageCount: number;
}[] = [
  {
    key: crypto.randomBytes(32).toString("hex"),
    userId: "user-123",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    usageCount: 0, // Track how many times this API key is used
  },
  {
    key: crypto.randomBytes(32).toString("hex"),
    userId: "user-456",
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    usageCount: 0,
  },
];

// The GET request handler returns all API keys or the keys for a specific user or a list of ALL keys
// Usage: GET /api/api-key?userId=user-123
// Returns: [{ key: "abc123", userId: "user-123", expiresAt: "2022-01-01T00:00:00.000Z", usageCount: 0 }]
// Usage: GET /api/api-key
// Returns: All API keys as JSON
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const userKeys = apiKeys.filter((key) => key.userId === userId);
    return NextResponse.json(userKeys);
  }

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
    const { userId, expiresAt } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const apiKey = crypto.randomBytes(32).toString("hex");

    // Use provided expiry date if valid, otherwise default to 30 days
    const expiryDate = expiresAt
      ? new Date(expiresAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (isNaN(expiryDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid expiry date format" },
        { status: 400 }
      );
    }

    const newKey = {
      key: apiKey,
      userId,
      expiresAt: expiryDate,
      usageCount: 0, // Start with 0 usage
    };

    apiKeys.push(newKey);

    return NextResponse.json({
      apiKey: newKey.key,
      expiresAt: newKey.expiresAt,
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}

// The PATCH request handler updates the usage count for a given API key
// It is mainly used by the side application to update usage count for a given key
// By providing a valid API key, the usage count will be incremented by 1
export async function PATCH(req: Request) {
  const { key } = await req.json();

  console.log("Received API key:", key);

  if (!key) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  const apiKey = apiKeys.find((apiKey) => apiKey.key === key);

  console.log("Found API key:", apiKey);

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  // Increment the usage count
  apiKey.usageCount += 1;

  return NextResponse.json({
    message: "API key usage updated",
    usageCount: apiKey.usageCount,
  });
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
  const { key } = await req.json();

  if (!key) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  const index = apiKeys.findIndex((apiKey) => apiKey.key === key);
  if (index === -1) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  apiKeys.splice(index, 1);
  return NextResponse.json({ message: "API key deleted" });
}
