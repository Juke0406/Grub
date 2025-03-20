import { auth } from "@/lib/auth";
import { getDatabase, toObjectId } from "@/lib/mongodb";
import {
  DEFAULT_RATING,
  RATING_PENALTIES,
  UserRating,
} from "@/types/user-rating";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reservationId = params.id;
    if (!reservationId) {
      return NextResponse.json(
        { error: "Reservation ID is required" },
        { status: 400 }
      );
    }

    const reservationObjectId = toObjectId(reservationId);
    if (!reservationObjectId) {
      return NextResponse.json({ error: "Invalid objectId" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("reservations");

    // Find the reservation and verify it's in ready state
    const reservation = await collection.findOne({
      _id: reservationObjectId,
      status: "ready",
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found or not in ready state" },
        { status: 404 }
      );
    }

    // Update reservation status to cancelled
    await collection.updateOne(
      { _id: reservationObjectId },
      { $set: { status: "cancelled" } }
    );

    // Update user rating for not collecting
    const userRatingsCollection = db.collection("userRatings");
    let userRating = await userRatingsCollection.findOne<UserRating>({
      userId: reservation.userId,
    });

    if (!userRating) {
      // Create new rating entry
      const newRating: Omit<UserRating, "_id"> = {
        userId: reservation.userId,
        rating: DEFAULT_RATING,
        lastUpdated: new Date().toISOString(),
      };
      await userRatingsCollection.insertOne(newRating);
      userRating = {
        ...newRating,
        _id: (await userRatingsCollection.findOne<UserRating>({
          userId: reservation.userId,
        }))!._id,
      };
    }

    // Update rating, ensuring it stays between 0 and 100
    const updatedRating = Math.max(
      0,
      Math.min(100, userRating.rating + RATING_PENALTIES.NOT_COLLECTED)
    );

    await userRatingsCollection.updateOne(
      { userId: reservation.userId },
      {
        $set: {
          rating: updatedRating,
          lastUpdated: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json({
      message: "Order marked as not collected",
    });
  } catch (error) {
    console.error("Error marking order as not collected:", error);
    return NextResponse.json(
      { error: "Failed to mark order as not collected" },
      { status: 500 }
    );
  }
}
