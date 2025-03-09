import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse incoming request body
    const products = await req.json();

    if (!Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid data format. Expected an array of products." }, { status: 400 });
    }

    console.log("Received Product Data:");

    // Loop through the products and print details
    products.forEach((product) => {
      console.log(product);
      console.log("-".repeat(40));
    });

    return NextResponse.json({ message: "Products received successfully!" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}
