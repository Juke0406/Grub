import { auth } from "@/lib/auth";
import { getDatabase, toObjectId } from "@/lib/mongodb";
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

    const { pin } = await request.json();
    if (!pin) {
      return NextResponse.json(
        { error: "Completion pin is required" },
        { status: 400 }
      );
    }

    const reservationObjectId = toObjectId(reservationId);
    if (!reservationObjectId) {
      return NextResponse.json({ error: "Invalid objectId" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("reservations");

    // Find the reservation and verify ownership and status
    const reservation = await collection.findOne({
      _id: reservationObjectId,
      userId: session.user.id, // Ensure the requester is the buyer
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found or not authorized" },
        { status: 404 }
      );
    }

    // Verify reservation is in ready state
    if (reservation.status !== "ready") {
      return NextResponse.json(
        { error: "Reservation must be ready for pickup to complete" },
        { status: 400 }
      );
    }

    // Verify completion pin
    if (reservation.completionPin !== pin) {
      return NextResponse.json(
        { error: "Invalid completion pin" },
        { status: 400 }
      );
    }

    // Update reservation to completed
    const result = await collection.findOneAndUpdate(
      { _id: reservationObjectId, userId: session.user.id },
      { $set: { status: "completed" } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Failed to update reservation" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Reservation completed successfully",
    });
  } catch (error) {
    console.error("Error completing reservation:", error);
    return NextResponse.json(
      { error: "Failed to complete reservation" },
      { status: 500 }
    );
  }
}
