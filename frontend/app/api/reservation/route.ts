import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { Reservation } from "@/types/reservation";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface ReservationItem {
  name: string;
  quantity: number;
  originalPrice: number;
  discountPercentage: number;
  image: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    console.log("Session data:", JSON.stringify(session, null, 2));

    if (!session || !session.user) {
      console.log("No session or user found");
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
    const query: any = { userId: userId };
    if (status) {
      const statusArray = status.split(",");
      query.status = { $in: statusArray };
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();

    // validate data
    if (
      !data.storeName ||
      !data.storeLocation ||
      !data.storeImage ||
      !data.items ||
      !data.items.length
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    for (const item of data.items) {
      if (
        !item.name ||
        !item.quantity ||
        !item.originalPrice ||
        !item.discountPercentage ||
        !item.image
      ) {
        return NextResponse.json(
          { error: "Invalid item data" },
          { status: 400 }
        );
      }
    }

    // Generate a 6-digit completion pin
    const completionPin = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const newReservation: Omit<Reservation, "_id"> = {
      userId,
      storeName: data.storeName,
      storeLocation: data.storeLocation,
      storeImage: data.storeImage,
      items: data.items.map((item: ReservationItem) => ({
        ...item,
        image: item.image,
      })),
      status: "pending",
      pickupTime: data.pickUpTime,
      pickupEndTime: data.pickUpEndTime,
      createdAt: new Date().toISOString(),
      completionPin,
    };

    const db = await getDatabase();
    const collection = db.collection("reservations");
    const result = await collection.insertOne(newReservation);

    return NextResponse.json({
      message: "Reservation created successfully",
      reservationId: result.insertedId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { reservationId, status, rating } = data;

    if (!reservationId) {
      return NextResponse.json(
        { error: "Reservation ID is required" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection("reservations");

    const reservation = await collection.findOne({
      _id: reservationId,
      userId: session.user.id,
    });

    if (!reservation) {
      return NextResponse.json(
        {
          error: "Reservation does not exist.",
        },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (status) {
      // Validate status is one of the allowed values
      if (
        !["pending", "confirmed", "ready", "completed", "cancelled"].includes(
          status
        )
      ) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (rating) {
      // Only allow rating if reservation is completed
      if (reservation.status !== "completed" && status !== "completed") {
        return NextResponse.json(
          { error: "Can only rate completed reservations" },
          { status: 400 }
        );
      }

      // Validate rating data
      if (
        typeof rating.score !== "number" ||
        rating.score < 1 ||
        rating.score > 5
      ) {
        return NextResponse.json(
          { error: "Invalid rating score" },
          { status: 400 }
        );
      }

      updateData.rating = {
        score: rating.score,
        comment: rating.comment || "",
        createdAt: new Date().toISOString(),
      };
    }

    if (updateData.keys.length === 0) {
      return NextResponse.json(
        { error: "No valid data to update" },
        { status: 400 }
      );
    }

    await collection.updateOne(
      {
        _id: reservationId,
        userId: session.user.id,
      },
      { $set: updateData }
    );

    return NextResponse.json({
      message: "Reservation updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update reservation" },
      { status: 500 }
    );
  }
}

// export async function DELETE(request: NextRequest, { params }: { params: { _id: string } }) {
//   try {
//     const session = await auth.api.getSession({
//       headers: await headers(), // you need to pass the headers object.
//     });

//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const searchParams = request.nextUrl.searchParams;
//     // const reservationId = searchParams.get("id");
//     const reservationId = params._id;
//     if (!reservationId) {
//       return NextResponse.json(
//         { error: "Reservation ID is required" },
//         { status: 400 }
//       );
//     }

//     const reservationObjectId = toObjectId(reservationId);
//     if (!reservationObjectId) {
//       return NextResponse.json({ error: "Invalid objectId" }, { status: 400 });
//     }

//     const db = await getDatabase();
//     const collection = db.collection("reservations");

//     // Find the reservation to ensure it belongs to the user
//     const reservation = await collection.findOne({
//       _id: reservationObjectId,
//       userId: session.user.id,
//     });

//     if (!reservation) {
//       return NextResponse.json(
//         { error: "Reservation not found or not authorized" },
//         { status: 404 }
//       );
//     }

//     // Check if reservation can be cancelled (only pending or confirmed reservations)
//     if (!["pending", "confirmed"].includes(reservation.status)) {
//       return NextResponse.json(
//         { error: "Only pending or confirmed reservations can be cancelled" },
//         { status: 400 }
//       );
//     }

//     // Update the reservation status to cancelled
//     await collection.updateOne(
//       { _id: reservationObjectId, userId: session.user.id },
//       { $set: { status: "cancelled" } }
//     );

//     return NextResponse.json({
//       message: "Reservation cancelled successfully",
//     });
//   } catch (error) {
//     console.error("Error cancelling reservation:", error);
//     return NextResponse.json(
//       { error: "Failed to cancel reservation" },
//       { status: 500 }
//     );
//   }
// }
