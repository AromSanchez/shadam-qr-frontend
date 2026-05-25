import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// PATCH /api/menus/[menuId]/productos/[productoId]/toggle
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ menuId: string; productoId: string }> }
) {
  try {
    const { menuId, productoId } = await params;

    const backendRes = await fetch(`${BACKEND_URL}/menus/${menuId}/productos/${productoId}/toggle`, {
      method: "PATCH",
    });

    const data = await backendRes.json();
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Menus Product Toggle API PATCH] Error:", error);
    return NextResponse.json({ error: "Error connecting to backend" }, { status: 502 });
  }
}
