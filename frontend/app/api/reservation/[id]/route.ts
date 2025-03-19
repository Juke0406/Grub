import { auth } from "@/lib/auth";
import { getDatabase, toObjectId } from "@/lib/mongodb";
import { Reservation } from "@/types/reservation";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
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

    const { status } = await request.json();
    if (!status || !["confirmed", "ready", "completed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status update" },
        { status: 400 }
      );
    }

    const reservationObjectId = toObjectId(reservationId);
    if (!reservationObjectId) {
      return NextResponse.json({ error: "Invalid objectId" }, { status: 400 });
    }

    const db = await getDatabase();
    const collection = db.collection("reservations");

    // Generate completion pin if status is being set to completed
    const updateData: Partial<Reservation> = { status };
    if (status === "completed") {
      // Generate a 6-digit pin
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      updateData.completionPin = pin;
    }

    const result = await collection.findOneAndUpdate(
      { _id: reservationObjectId },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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
