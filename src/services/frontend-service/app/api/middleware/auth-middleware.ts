import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { Document, WithId } from "mongodb";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface AuthResult {
  store: WithId<Document>;
  type: "apiKey" | "session";
}

export async function authMiddleware(
  request: NextRequest
): Promise<AuthResult | NextResponse> {
  // Check for API key in headers
  const headersList = await headers();
  const apiKey = headersList.get("x-api-key");

  if (apiKey) {
    // Verify API key
    const db = await getDatabase();
    const apiKeyDoc = await db.collection("api_keys").findOne({ key: apiKey });

    console.log(apiKeyDoc);
    if (!apiKeyDoc) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Get store for user
    const store = await db
      .collection("stores")
      .findOne({ ownerId: apiKeyDoc.userId });
    console.log(store);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return { store, type: "apiKey" };
  }

  // Fall back to session auth
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get store for session user
  const db = await getDatabase();
  const store = await db
    .collection("stores")
    .findOne({ ownerId: session.user.id });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return { store, type: "session" };
}
