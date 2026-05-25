import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// GET /api/products/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendRes = await fetch(`${BACKEND_URL}/productos/${id}`, {
      cache: "no-store",
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Product not found" }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    if (!data) {
      return NextResponse.json(null);
    }

    const mappedProduct = {
      ...data,
      id: String(data.id),
      name: data.nombre,
      description: data.descripcion || "",
      price: Number(data.precio),
      categoryId: data.categoria?.toLowerCase() || "",
      image: data.imagen ? (data.imagen.startsWith("http") ? data.imagen : `${BACKEND_URL}${data.imagen}`) : "",
      available: true,
    };

    return NextResponse.json(mappedProduct);
  } catch (error) {
    console.error("[Products API GET ID] Error:", error);
    return NextResponse.json({ error: "Error connecting to backend" }, { status: 502 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendRes = await fetch(`${BACKEND_URL}/productos/${id}`, {
      method: "DELETE",
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Product not found or delete failed" }, { status: backendRes.status });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("[Products API DELETE] Error:", error);
    return NextResponse.json({ error: "Error deleting product" }, { status: 502 });
  }
}

// PUT /api/products/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Map frontend fields back to backend naming
    const payload: Record<string, any> = {};
    if (body.name !== undefined) payload.nombre = body.name;
    if (body.description !== undefined) payload.descripcion = body.description;
    if (body.price !== undefined) payload.precio = String(body.price);
    if (body.categoryId !== undefined) payload.categoria = body.categoryId.toUpperCase();

    // Note: since PUT in backend isn't documented to support multipart/form-data directly or is not yet implemented,
    // we send JSON payload for PUT.
    const backendRes = await fetch(`${BACKEND_URL}/productos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Product not found or update failed" }, { status: backendRes.status });
    }

    const data = await backendRes.json();

    const mappedProduct = {
      ...data,
      id: String(data.id),
      name: data.nombre,
      description: data.descripcion || "",
      price: Number(data.precio),
      categoryId: data.categoria?.toLowerCase() || "",
      image: data.imagen ? (data.imagen.startsWith("http") ? data.imagen : `${BACKEND_URL}${data.imagen}`) : "",
      available: true,
    };

    return NextResponse.json(mappedProduct);
  } catch (error) {
    console.error("[Products API PUT] Error:", error);
    return NextResponse.json({ error: "Error updating product" }, { status: 502 });
  }
}

