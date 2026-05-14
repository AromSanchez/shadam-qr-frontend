import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

// GET /api/products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    let products = db.products;

    if (categoryId) {
      products = products.filter(p => p.categoryId === categoryId);
    }

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 });
  }
}

// POST /api/products
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.price || !body.categoryId) {
      return NextResponse.json({ error: "Name, price and categoryId are required" }, { status: 400 });
    }

    const newProduct = {
      id: db.generateId("prod"),
      name: body.name,
      description: body.description || "",
      price: Number(body.price),
      categoryId: body.categoryId,
      image: body.image || "",
      available: body.available !== undefined ? body.available : true,
      calories: body.calories || "",
      time: body.time || "",
      popular: body.popular || false,
      createdAt: new Date().toISOString(),
    };

    db.products.push(newProduct);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating product" }, { status: 500 });
  }
}
