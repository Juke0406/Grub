import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { getDatabase, toObjectId } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Reservation } from "@/types/reservation";


export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    // const reservationId = searchParams.get("id");
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

    // Find the reservation to ensure it belongs to the user
    const reservation = await collection.findOne({
      _id: reservationObjectId,
      userId: session.user.id,
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found or not authorized" },
        { status: 404 }
      );
    }

    // Check if reservation can be cancelled (only pending or confirmed reservations)
    if (!["pending", "confirmed"].includes(reservation.status)) {
      return NextResponse.json(
        { error: "Only pending or confirmed reservations can be cancelled" },
        { status: 400 }
      );
    }

    // Update the reservation status to cancelled
    await collection.updateOne(
      { _id: reservationObjectId, userId: session.user.id },
      { $set: { status: "cancelled" } }
    );

    return NextResponse.json({
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    return NextResponse.json(
      { error: "Failed to cancel reservation" },
      { status: 500 }
    );
  }
}
