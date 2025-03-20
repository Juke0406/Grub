import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { DEFAULT_RATING, UserRating } from "@/types/user-rating";
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

    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("userRatings");

    let userRating = await collection.findOne<UserRating>({ userId });

    if (!userRating) {
      // Create default rating for new user
      const newRating: Omit<UserRating, "_id"> = {
        userId,
        rating: DEFAULT_RATING,
        lastUpdated: new Date().toISOString(),
      };
      const result = await collection.insertOne(newRating);
      userRating = { ...newRating, _id: result.insertedId.toString() };
    }

    return NextResponse.json(userRating);
  } catch (error) {
    console.error("Error fetching user rating:", error);
    return NextResponse.json(
      { error: "Failed to fetch user rating" },
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

    const { userId, ratingChange } = await request.json();

    if (!userId || typeof ratingChange !== "number") {
      return NextResponse.json(
        { error: "User ID and rating change are required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("userRatings");

    let userRating = await collection.findOne<UserRating>({ userId });

    if (!userRating) {
      // Create new rating entry
      const newRating: Omit<UserRating, "_id"> = {
        userId,
        rating: DEFAULT_RATING,
        lastUpdated: new Date().toISOString(),
      };
      const result = await collection.insertOne(newRating);
      userRating = { ...newRating, _id: result.insertedId.toString() };
    }

    // Update rating, ensuring it stays between 0 and 100
    const newRating = Math.max(
      0,
      Math.min(100, userRating.rating + ratingChange)
    );

    const result = await collection.findOneAndUpdate(
      { userId },
      {
        $set: {
          rating: newRating,
          lastUpdated: new Date().toISOString(),
        },
      },
      { returnDocument: "after" }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating user rating:", error);
    return NextResponse.json(
      { error: "Failed to update user rating" },
      { status: 500 }
    );
  }
}
