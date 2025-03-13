import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import { authClient } from "@/lib/auth-client";

export async function GET(request: NextRequest) {
  try {
    const { data: session } = await authClient.getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status"); // if null, show all
    const limit = parseInt(searchParams.get("limit") || "10"); // number of items to return
    const page = parseInt(searchParams.get("page") || "1"); // page to view
    const skip = (page - 1) * limit; // pages to skip

    const db = await getDatabase();
    const collection = db.collection("reservations");

    // find all reservations belonging to user and specific status if there are any
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const reservations = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(query);

    return NextResponse.json({
      reservations,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}
