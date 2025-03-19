import { auth } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const db = await getDatabase();
    const store = await db.collection("stores").findOne({ ownerId: userId });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("[STORES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      location,
      businessHours,
      contactNumber,
      email,
      type,
    } = body;

    if (!name || !location || !businessHours || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const db = await getDatabase();

    // Check if store already exists for this user
    const existingStore = await db
      .collection("stores")
      .findOne({ ownerId: userId });
    if (existingStore) {
      return new NextResponse("Store already exists for this user", {
        status: 400,
      });
    }

    const store = {
      ownerId: userId,
      type,
      name,
      description,
      location,
      businessHours,
      contactNumber,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("stores").insertOne(store);
    return NextResponse.json({ ...store, _id: result.insertedId });
  } catch (error) {
    console.error("[STORES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      location,
      businessHours,
      contactNumber,
      email,
      type,
    } = body;

    if (!name || !location || !businessHours || !type) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const db = await getDatabase();
    const existingStore = await db
      .collection("stores")
      .findOne({ ownerId: userId });

    if (!existingStore) {
      return new NextResponse("Store not found", { status: 404 });
    }

    const storeUpdate = {
      ownerId: userId,
      type,
      name,
      description,
      location,
      businessHours,
      contactNumber,
      email,
      createdAt: existingStore.createdAt,
      updatedAt: new Date(),
    };

    await db
      .collection("stores")
      .updateOne({ ownerId: userId }, { $set: storeUpdate });

    return NextResponse.json({ ...storeUpdate, _id: existingStore._id });
  } catch (error) {
    console.error("[STORES_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
