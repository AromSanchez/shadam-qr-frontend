import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// GET /api/menus/actual
export async function GET() {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/menus/actual`, { cache: "no-store" });
    if (backendRes.status === 404) {
      return NextResponse.json({ message: "No active menu" }, { status: 404 });
    }
    if (!backendRes.ok) {
      return NextResponse.json({ error: "Error fetching current menu" }, { status: backendRes.status });
    }
    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Menus Actual API GET] Error:", error);
    return NextResponse.json({ error: "Error connecting to backend" }, { status: 502 });
  }
}
