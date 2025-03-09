import { NextResponse } from "next/server";
import crypto from "crypto";

const apiKeys: { key: string; userId: string; expiresAt: Date; usageCount: number }[] = [
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const userKeys = apiKeys.filter((key) => key.userId === userId);
    return NextResponse.json(userKeys);
  }

  return NextResponse.json(apiKeys);
}

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const apiKey = crypto.randomBytes(32).toString("hex");

  const newKey = {
    key: apiKey,
    userId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
    usageCount: 0, // Start with 0 usage
  };

  apiKeys.push(newKey);
  return NextResponse.json({ apiKey: newKey.key });
}

export async function PATCH(req: Request) {
  const { key } = await req.json();

  if (!key) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  const apiKey = apiKeys.find((apiKey) => apiKey.key === key);

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  // Increment the usage count
  apiKey.usageCount += 1;

  return NextResponse.json({ message: "API key usage updated", usageCount: apiKey.usageCount });
}

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
