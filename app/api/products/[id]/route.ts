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

// PUT /api/products/[id] - supports both JSON and form-data
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get("content-type") || "";

    let backendRes: Response;

    if (contentType.includes("multipart/form-data")) {
      // Forward form-data directly to backend (supports image upload)
      const formData = await request.formData();

      // Build a new FormData with backend field names
      const backendForm = new FormData();
      const name = formData.get("name");
      const description = formData.get("description");
      const price = formData.get("price");
      const categoryId = formData.get("categoryId");
      const imagen = formData.get("imagen");

      if (name) backendForm.append("nombre", name as string);
      if (description !== null) backendForm.append("descripcion", description as string);
      if (price) backendForm.append("precio", price as string);
      if (categoryId) backendForm.append("categoria", (categoryId as string).toUpperCase());
      if (imagen && imagen instanceof File && imagen.size > 0) {
        backendForm.append("imagen", imagen);
      }

      backendRes = await fetch(`${BACKEND_URL}/productos/${id}`, {
        method: "PATCH",
        body: backendForm,
      });
    } else {
      // JSON payload
      const body = await request.json();

      const payload: Record<string, any> = {};
      if (body.name !== undefined) payload.nombre = body.name;
      if (body.description !== undefined) payload.descripcion = body.description;
      if (body.price !== undefined) payload.precio = String(body.price);
      if (body.categoryId !== undefined) payload.categoria = body.categoryId.toUpperCase();

      backendRes = await fetch(`${BACKEND_URL}/productos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

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

