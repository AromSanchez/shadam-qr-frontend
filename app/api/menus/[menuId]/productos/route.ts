import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// POST /api/menus/[menuId]/productos
export async function POST(
  request: Request,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const { menuId } = await params;
    const body = await request.json();

    const backendRes = await fetch(`${BACKEND_URL}/menus/${menuId}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId: Number(body.productoId) }),
    });

    const data = await backendRes.json();
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Menus Add Product API POST] Error:", error);
    return NextResponse.json({ error: "Error connecting to backend" }, { status: 502 });
  }
}
