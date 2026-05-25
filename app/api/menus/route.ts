import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// GET /api/menus
export async function GET() {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/menus`, { cache: "no-store" });
    if (!backendRes.ok) {
      return NextResponse.json({ error: "Error fetching menus" }, { status: backendRes.status });
    }
    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Menus API GET] Error:", error);
    return NextResponse.json({ error: "Error connecting to backend" }, { status: 502 });
  }
}

// POST /api/menus
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendRes = await fetch(`${BACKEND_URL}/menus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: body.nombre }),
    });

    const data = await backendRes.json();
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Menus API POST] Error:", error);
    return NextResponse.json({ error: "Error connecting to backend" }, { status: 502 });
  }
}
