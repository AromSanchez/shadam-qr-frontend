import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const initialLength = db.products.length;
    db.products = db.products.filter((p) => p.id !== id);

    if (db.products.length === initialLength) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedProduct = {
      ...db.products[index],
      ...body,
      price: body.price !== undefined ? Number(body.price) : db.products[index].price,
      updatedAt: new Date().toISOString(),
    };

    db.products[index] = updatedProduct;

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: "Error updating product" }, { status: 500 });
  }
}
