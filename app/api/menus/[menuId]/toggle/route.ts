import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// PATCH /api/menus/[menuId]/toggle
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ menuId: string }> }
) {
  try {
    const { menuId } = await params;

    const backendRes = await fetch(`${BACKEND_URL}/menus/${menuId}/toggle`, {
      method: "PATCH",
    });

    const data = await backendRes.json();
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Menus Toggle Active API PATCH] Error:", error);
    return NextResponse.json({ error: "Error connecting to backend" }, { status: 502 });
  }
}
