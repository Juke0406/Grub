import { getDatabase } from "@/lib/mongodb";
import { StoreType } from "@/types/store";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    // Validate store type
    if (type && !Object.values(StoreType).includes(type as StoreType)) {
      return new NextResponse("Invalid store type", { status: 400 });
    }

    const db = await getDatabase();
    const query: Record<string, any> = {};

    // Add type filter if provided
    if (type) {
      query.type = type;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
      ];
    }

    const [stores, totalCount] = await Promise.all([
      db
        .collection("stores")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("stores").countDocuments(query),
    ]);

    console.log("Stores from DB:", stores);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      stores: stores.map((store) => ({
        _id: store._id.toString(),
        name: store.name,
        type: store.type,
        location: {
          address: store.location.address,
        },
        image: store.image,
        rating: Math.floor(Math.random() * 5) + 1,
        distance: Math.random() * 5,
        businessHours: store.businessHours,
        storeHoursToday: {
          open: store.businessHours[0].open,
          close: store.businessHours[0].close,
          isOpen: store.businessHours[0].isOpen,
        },
      })),
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("[STORES_LIST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
