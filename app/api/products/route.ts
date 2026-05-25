import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// GET /api/products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    // Fetch from real backend
    const backendRes = await fetch(`${BACKEND_URL}/productos`, {
      cache: "no-store",
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Error fetching products from backend" }, { status: backendRes.status });
    }

    let products = await backendRes.json();

    // Map backend categories to frontend values if necessary
    // Backend returns "ENTRADA" or "MENU". Frontend uses "entrada" or "menu".
    products = products.map((p: any) => ({
      ...p,
      id: String(p.id),
      name: p.nombre,
      description: p.descripcion || "",
      price: Number(p.precio || 0),
      categoryId: p.categoria?.toLowerCase() || "",
      image: p.imagen ? (p.imagen.startsWith("http") ? p.imagen : `${BACKEND_URL}${p.imagen}`) : "",
    }));

    if (categoryId) {
      products = products.filter((p: any) => p.categoryId === categoryId.toLowerCase());
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("[Products API GET] Error:", error);
    return NextResponse.json({ error: "Error connecting to backend" }, { status: 502 });
  }
}

// POST /api/products
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    
    let backendResponse;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      
      // Forward form-data to the backend
      backendResponse = await fetch(`${BACKEND_URL}/productos`, {
        method: "POST",
        body: formData, // fetch will automatically set the correct Boundary header
      });
    } else {
      // JSON fallback, build a Form-data structure because the backend documentation requires body: form-data
      const body = await request.json();
      const formData = new FormData();
      formData.append("nombre", body.name || body.nombre || "");
      formData.append("descripcion", body.description || body.descripcion || "");
      formData.append("precio", String(body.price || body.precio || "0"));
      formData.append("categoria", (body.categoryId || body.categoria || "").toUpperCase());
      
      backendResponse = await fetch(`${BACKEND_URL}/productos`, {
        method: "POST",
        body: formData,
      });
    }

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    // Map backend response back to frontend interface
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

    return NextResponse.json(mappedProduct, { status: 201 });
  } catch (error) {
    console.error("[Products API POST] Error:", error);
    return NextResponse.json({ error: "Error creating product in backend" }, { status: 502 });
  }
}

