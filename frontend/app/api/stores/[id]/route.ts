import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const skip = (page - 1) * limit;

  try {
    const { id } = params;
    const db = await getDatabase();

    // Get store
    const store = await db
      .collection("stores")
      .findOne({ _id: new ObjectId(id) });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    // Prepare query for products
    const query: any = {
      storeId: store._id.toString(),
    };

    // Add search filter
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Add category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Get store's products with pagination
    console.log("Looking for products with query:", query);
    const [products, totalProducts] = await Promise.all([
      db.collection("products").find(query).skip(skip).limit(limit).toArray(),
      db.collection("products").countDocuments(query),
    ]);

    console.log("Found products:", products);

    const formattedProducts = products.map((product) => ({
      ...product,
      _id: product._id.toString(),
      storeId: product.storeId.toString(),
      image: product.imageUrl, // Rename imageUrl to image for client components
    }));

    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      store: {
        ...store,
        _id: store._id.toString(),
      },
      products: formattedProducts,
      pagination: {
        page,
        pages: totalPages,
        totalItems: totalProducts,
      },
    });
  } catch (error) {
    console.error("[STORE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
