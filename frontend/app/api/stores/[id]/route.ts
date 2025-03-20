import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Get store's products
    console.log("Looking for products with storeId:", id);
    const products = await db
      .collection("products")
      .find({
        storeId: store._id.toString(), // Use toString() since products store storeId as string
      })
      .toArray();
    console.log("Found products:", products);

    const formattedProducts = products.map((product) => ({
      ...product,
      _id: product._id.toString(),
      storeId: product.storeId.toString(),
      image: product.imageUrl, // Rename imageUrl to image for client components
    }));

    return NextResponse.json({
      store: {
        ...store,
        _id: store._id.toString(),
      },
      products: formattedProducts,
    });
  } catch (error) {
    console.error("[STORE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
